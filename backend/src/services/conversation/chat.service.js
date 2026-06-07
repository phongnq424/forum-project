const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { emitToUser, emitToChat } = require("../../socket/emitter");
const { NotificationService } = require("../notification.service");
const redisClient = require("../../config/redis");
const {
    uploadChatFiles,
    rollbackUploadedFiles,
    createMessageAndUpdateConversation,
    buildMessageResponse
} = require("./conversation-message.service");

function buildConversationFilter({ blockedIds, scope, topic_id, challenge_id } = {}) {
    const conversationFilter = {
        OR: [
            { type: "GROUP" },
            {
                type: "CHAT",
                ConversationUser: {
                    none: {
                        user_id: {
                            in: blockedIds || []
                        }
                    }
                }
            }
        ]
    };

    if (scope) {
        conversationFilter.scope = scope;
    }

    if (topic_id) {
        conversationFilter.topic_id = topic_id;
    }

    if (challenge_id) {
        conversationFilter.challenge_id = challenge_id;
    }

    return conversationFilter;
}

const ChatService = {
    createChat: async (userIds, { viewerId, blockContext } = {}) => {
        if (userIds.length !== 2) {
            throw new Error("Chat must have 2 users");
        }

        const otherUserId = userIds.find((id) => id !== viewerId);

        if (blockContext?.blockedSet?.has(otherUserId)) {
            throw new Error("User is blocked");
        }

        const existing = await prisma.conversation.findFirst({
            where: {
                type: "CHAT",
                ConversationUser: {
                    every: {
                        user_id: {
                            in: userIds
                        }
                    }
                }
            },
            include: {
                ConversationUser: true
            }
        });

        if (existing) return existing;

        const conversation = await prisma.conversation.create({
            data: {
                type: "CHAT",
                ConversationUser: {
                    create: userIds.map((id) => ({
                        user_id: id
                    }))
                }
            },
            include: {
                ConversationUser: true
            }
        });

        userIds.forEach((uid) => {
            emitToUser(uid, "chat:new", conversation);
        });

        return conversation;
    },

    listUserConversations: async (
        userId,
        { viewerId, blockContext, scope, topic_id, challenge_id } = {}
    ) => {
        const blockedIds = blockContext?.blockedUserIds
            ? Array.from(blockContext.blockedUserIds)
            : [];

        const rows = await prisma.conversationUser.findMany({
            where: {
                user_id: userId,
                left_at: null,
                Conversation: buildConversationFilter({
                    blockedIds,
                    scope,
                    topic_id,
                    challenge_id
                })
            },
            include: {
                Conversation: {
                    include: {
                        ConversationUser: {
                            where: {
                                User: {
                                    is_deleted: false,
                                    status: "ACTIVE"
                                }
                            },
                            include: {
                                User: {
                                    select: {
                                        id: true,
                                        username: true,
                                        avatar: true,
                                        fullname: true
                                    }
                                }
                            }
                        },
                        LastMessage: {
                            include: {
                                Sender: {
                                    select: {
                                        id: true,
                                        username: true,
                                        fullname: true,
                                        avatar: true
                                    }
                                },
                                Attachment: true
                            }
                        },
                        _count: {
                            select: {
                                Message: {
                                    where: {
                                        is_deleted: false,
                                        is_read: false,
                                        sender_id: {
                                            not: userId
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                joined_at: "desc"
            }
        });

        const peerIds = [];

        rows.forEach((cu) => {
            const conv = cu.Conversation;

            if (conv.type === "CHAT") {
                const peer = conv.ConversationUser
                    .map((item) => item.User)
                    .find((u) => u.id !== userId);

                if (peer) {
                    peerIds.push(peer.id);
                }
            }
        });

        const onlineKeys = peerIds.map((id) => `online:user:${id}`);
        let onlineResults = [];

        try {
            onlineResults =
                onlineKeys.length > 0 ? await redisClient.mget(onlineKeys) : [];
        } catch (error) {
            console.error(
                "[ChatService] Redis online check failed:",
                error.message
            );
            onlineResults = [];
        }

        const onlineMap = {};

        peerIds.forEach((id, i) => {
            onlineMap[id] = !!onlineResults[i];
        });

        rows.sort((a, b) => {
            const aLatestMessageAt = a.Conversation.last_message_at;
            const bLatestMessageAt = b.Conversation.last_message_at;

            const aTime = aLatestMessageAt
                ? new Date(aLatestMessageAt).getTime()
                : new Date(a.joined_at).getTime();

            const bTime = bLatestMessageAt
                ? new Date(bLatestMessageAt).getTime()
                : new Date(b.joined_at).getTime();

            return bTime - aTime;
        });

        return rows.map((cu) => {
            const conv = cu.Conversation;

            const peerUser =
                conv.type === "CHAT"
                    ? conv.ConversationUser
                        .map((item) => item.User)
                        .find((u) => u.id !== userId)
                    : null;

            return {
                conversationId: conv.id,
                type: conv.type,
                scope: conv.scope || "GENERAL",
                topic_id: conv.topic_id || null,
                challenge_id: conv.challenge_id || null,
                Topic: conv.Topic || null,
                Challenge: conv.Challenge || null,
                name: conv.type === "GROUP" ? conv.name : null,
                avatar:
                    conv.type === "GROUP"
                        ? conv.avatar
                        : peerUser?.avatar || null,
                peer: peerUser
                    ? {
                        id: peerUser.id,
                        username: peerUser.username,
                        fullname: peerUser.fullname,
                        avatar: peerUser.avatar,
                        online: onlineMap[peerUser.id] || false
                    }
                    : null,
                latestMsg: conv.LastMessage
                    ? buildMessageResponse(conv.LastMessage)
                    : null,
                unreadCount: conv._count.Message
            };
        });
    },

    sendDirectMessage: async (
        fromUserId,
        toUserId,
        content,
        { blockContext, files = [] } = {}
    ) => {
        if (blockContext?.blockedSet?.has(toUserId)) {
            throw new Error("User is blocked");
        }

        let conversation = await prisma.conversation.findFirst({
            where: {
                type: "CHAT",
                ConversationUser: {
                    every: {
                        user_id: {
                            in: [fromUserId, toUserId]
                        }
                    }
                }
            },
            include: {
                ConversationUser: true
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    type: "CHAT",
                    ConversationUser: {
                        create: [
                            {
                                user_id: fromUserId
                            },
                            {
                                user_id: toUserId
                            }
                        ]
                    }
                },
                include: {
                    ConversationUser: true
                }
            });

            emitToUser(fromUserId, "chat:new", conversation);
            emitToUser(toUserId, "chat:new", conversation);
        }

        const uploadedFiles =
            files.length > 0 ? await uploadChatFiles(files, conversation.id) : [];

        let message;

        try {
            message = await prisma.$transaction(async (tx) => {
                return await createMessageAndUpdateConversation(
                    tx,
                    conversation.id,
                    fromUserId,
                    content,
                    uploadedFiles
                );
            });
        } catch (error) {
            await rollbackUploadedFiles(uploadedFiles);
            throw error;
        }

        emitToChat(conversation.id, "chat:message:new", message);

        emitToUser(toUserId, "chat:message:new", {
            conversationId: conversation.id,
            message
        });

        NotificationService.create({
            user_id: toUserId,
            actor_id: fromUserId,
            type: "MESSAGE",
            title: "New Message",
            message: content || (uploadedFiles.length > 0 ? "Sent a file" : ""),
            ref_id: conversation.id
        }).catch(console.error);

        return {
            conversationId: conversation.id,
            message
        };
    }
};

module.exports = { ChatService };