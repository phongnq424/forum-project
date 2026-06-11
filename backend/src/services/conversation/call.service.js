const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { emitToUser } = require("../../socket/emitter");
const { emitToChat } = require("../../socket/emitter");
const { buildMessageResponse } = require("./conversation-message.service");

const ACTIVE_CALL_STATUSES = ["RINGING", "ONGOING"];
const FINAL_CALL_STATUSES = ["ENDED", "MISSED", "REJECTED", "CANCELED", "FAILED"];

const userSelect = {
    id: true,
    username: true,
    fullname: true,
    avatar: true
};

const callInclude = {
    Caller: {
        select: userSelect
    },
    Receiver: {
        select: userSelect
    },
    EndedBy: {
        select: userSelect
    }
};

const messageInclude = {
    Sender: {
        select: userSelect
    },
    Attachment: true
};

function normalizeCallType(type) {
    const value = String(type || "AUDIO").toUpperCase();

    if (!["AUDIO", "VIDEO"].includes(value)) {
        throw new Error("Invalid call type");
    }

    return value;
}

function buildCallResponse(call) {
    return {
        id: call.id,
        conversation_id: call.conversation_id,
        caller_id: call.caller_id,
        receiver_id: call.receiver_id,
        type: call.type,
        status: call.status,
        started_at: call.started_at,
        answered_at: call.answered_at,
        ended_at: call.ended_at,
        ended_by_id: call.ended_by_id,
        caller: call.Caller || null,
        receiver: call.Receiver || null,
        endedBy: call.EndedBy || null
    };
}

function formatDuration(startAt, endAt) {
    if (!startAt || !endAt) return "00:00";

    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();

    const totalSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return `${minutes}:${seconds}`;
}

function buildCallMessageContent(call, finalStatus) {
    const label = call.type === "VIDEO" ? "Video call" : "Voice call";

    if (finalStatus === "ENDED") {
        const baseTime = call.answered_at || call.started_at;
        return `${label} ended · ${formatDuration(baseTime, call.ended_at)}`;
    }

    if (finalStatus === "MISSED") {
        return `Missed ${label.toLowerCase()}`;
    }

    if (finalStatus === "REJECTED") {
        return `${label} declined`;
    }

    if (finalStatus === "CANCELED") {
        return `${label} canceled`;
    }

    if (finalStatus === "FAILED") {
        return `${label} failed`;
    }

    return label;
}

async function findChatConversationForUser(conversationId, userId) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            type: "CHAT",
            ConversationUser: {
                some: {
                    user_id: userId,
                    left_at: null
                }
            }
        },
        include: {
            ConversationUser: {
                where: {
                    left_at: null,
                    User: {
                        is_deleted: false,
                        status: "ACTIVE"
                    }
                },
                include: {
                    User: {
                        select: userSelect
                    }
                }
            }
        }
    });

    if (!conversation) {
        throw new Error("Conversation not found");
    }

    if (conversation.ConversationUser.length !== 2) {
        throw new Error("Call is only supported for 1-1 chat");
    }

    return conversation;
}

function getPeerUserIdFromConversation(conversation, userId) {
    const peer = conversation.ConversationUser.find((item) => item.user_id !== userId);

    if (!peer) {
        throw new Error("Receiver not found");
    }

    return peer.user_id;
}

async function ensureUsersAvailable(callerId, receiverId) {
    const activeCall = await prisma.call.findFirst({
        where: {
            status: {
                in: ACTIVE_CALL_STATUSES
            },
            OR: [
                { caller_id: callerId },
                { receiver_id: callerId },
                { caller_id: receiverId },
                { receiver_id: receiverId }
            ]
        }
    });

    if (activeCall) {
        throw new Error("User is busy");
    }
}

async function findCallForUser(callId, userId) {
    const call = await prisma.call.findFirst({
        where: {
            id: callId,
            OR: [
                { caller_id: userId },
                { receiver_id: userId }
            ]
        },
        include: callInclude
    });

    if (!call) {
        throw new Error("Call not found");
    }

    return call;
}

function getPeerIdFromCall(call, userId) {
    if (call.caller_id === userId) return call.receiver_id;
    if (call.receiver_id === userId) return call.caller_id;

    throw new Error("User is not a participant of this call");
}

async function createCallMessageAndUpdateConversation(tx, call, finalStatus, senderId) {
    const existingMessage = await tx.message.findFirst({
        where: {
            call_id: call.id,
            is_deleted: false
        },
        include: messageInclude
    });

    if (existingMessage) {
        return existingMessage;
    }

    const content = buildCallMessageContent(call, finalStatus);

    const message = await tx.message.create({
        data: {
            conversation_id: call.conversation_id,
            sender_id: senderId,
            content,
            type: "CALL",
            call_id: call.id
        },
        include: messageInclude
    });

    await tx.conversation.update({
        where: {
            id: call.conversation_id
        },
        data: {
            last_message_id: message.id,
            last_message_at: message.sent_at
        }
    });

    return message;
}

async function finishCall(callId, userId, finalStatus) {
    if (!FINAL_CALL_STATUSES.includes(finalStatus)) {
        throw new Error("Invalid final call status");
    }

    const currentCall = await findCallForUser(callId, userId);

    if (FINAL_CALL_STATUSES.includes(currentCall.status)) {
        throw new Error("Call already completed");
    }

    if (finalStatus === "ENDED" && currentCall.status !== "ONGOING") {
        throw new Error("Call is not ongoing");
    }

    if (
        ["MISSED", "REJECTED", "CANCELED", "FAILED"].includes(finalStatus) &&
        currentCall.status !== "RINGING"
    ) {
        throw new Error("Call is not ringing");
    }

    const result = await prisma.$transaction(async (tx) => {
        const endedAt = new Date();

        const updatedCall = await tx.call.update({
            where: {
                id: callId
            },
            data: {
                status: finalStatus,
                ended_at: endedAt,
                ended_by_id: userId
            },
            include: callInclude
        });

        const message = await createCallMessageAndUpdateConversation(
            tx,
            updatedCall,
            finalStatus,
            userId
        );

        return {
            call: updatedCall,
            message
        };
    });

    const callResponse = buildCallResponse(result.call);
    const messageResponse = buildMessageResponse(result.message);

    emitToChat(result.call.conversation_id, "call:updated", callResponse);
    emitToChat(result.call.conversation_id, "chat:message:new", messageResponse);

    const peerId = getPeerIdFromCall(result.call, userId);

    if (peerId) {
        emitToUser(peerId, "call:ended", {
            call: callResponse,
            message: messageResponse
        });
    }

    return {
        call: callResponse,
        message: messageResponse
    };
}

const CallService = {
    startCall: async (conversationId, callerId, type, { blockContext } = {}) => {
        const callType = normalizeCallType(type);

        const conversation = await findChatConversationForUser(conversationId, callerId);
        const receiverId = getPeerUserIdFromConversation(conversation, callerId);

        if (blockContext?.blockedSet?.has(receiverId)) {
            throw new Error("User is blocked");
        }

        await ensureUsersAvailable(callerId, receiverId);

        const call = await prisma.call.create({
            data: {
                conversation_id: conversationId,
                caller_id: callerId,
                receiver_id: receiverId,
                type: callType,
                status: "RINGING"
            },
            include: callInclude
        });

        const callResponse = buildCallResponse(call);

        emitToUser(callerId, "call:started", callResponse);
        emitToUser(receiverId, "call:incoming", callResponse);
        emitToChat(conversationId, "call:incoming", callResponse);

        return callResponse;
    },

    listCalls: async (conversationId, viewerId) => {
        await findChatConversationForUser(conversationId, viewerId);

        const calls = await prisma.call.findMany({
            where: {
                conversation_id: conversationId
            },
            include: callInclude,
            orderBy: {
                started_at: "desc"
            }
        });

        return calls.map(buildCallResponse);
    },

    getCall: async (callId, viewerId) => {
        const call = await findCallForUser(callId, viewerId);
        return buildCallResponse(call);
    },

    acceptCall: async (callId, viewerId) => {
        const call = await findCallForUser(callId, viewerId);

        if (call.status !== "RINGING") {
            throw new Error("Call is not ringing");
        }

        if (call.receiver_id !== viewerId) {
            throw new Error("Only receiver can accept this call");
        }

        const updatedCall = await prisma.call.update({
            where: {
                id: callId
            },
            data: {
                status: "ONGOING",
                answered_at: new Date()
            },
            include: callInclude
        });

        const callResponse = buildCallResponse(updatedCall);

        emitToUser(updatedCall.caller_id, "call:answered", callResponse);
        emitToUser(updatedCall.receiver_id, "call:answered", callResponse);
        emitToChat(updatedCall.conversation_id, "call:updated", callResponse);

        return callResponse;
    },

    rejectCall: async (callId, viewerId) => {
        const call = await findCallForUser(callId, viewerId);

        if (call.receiver_id !== viewerId) {
            throw new Error("Only receiver can reject this call");
        }

        return finishCall(callId, viewerId, "REJECTED");
    },

    cancelCall: async (callId, viewerId) => {
        const call = await findCallForUser(callId, viewerId);

        if (call.caller_id !== viewerId) {
            throw new Error("Only caller can cancel this call");
        }

        return finishCall(callId, viewerId, "CANCELED");
    },

    endCall: async (callId, viewerId) => {
        const call = await findCallForUser(callId, viewerId);

        if (call.status === "RINGING") {
            if (call.caller_id === viewerId) {
                return finishCall(callId, viewerId, "CANCELED");
            }

            if (call.receiver_id === viewerId) {
                return finishCall(callId, viewerId, "REJECTED");
            }
        }

        return finishCall(callId, viewerId, "ENDED");
    },

    markMissedCall: async (callId, viewerId) => {
        await findCallForUser(callId, viewerId);
        return finishCall(callId, viewerId, "MISSED");
    },

    forwardRtcSignal: async (callId, viewerId, eventName, payload = {}) => {
        const call = await findCallForUser(callId, viewerId);

        if (!ACTIVE_CALL_STATUSES.includes(call.status)) {
            throw new Error("Call is not active");
        }

        const peerId = getPeerIdFromCall(call, viewerId);

        if (!peerId) {
            throw new Error("Receiver not found");
        }

        emitToUser(peerId, eventName, {
            callId: call.id,
            conversationId: call.conversation_id,
            fromUserId: viewerId,
            ...payload,
        });

        return {
            success: true
        };
    }
};

module.exports = { CallService };