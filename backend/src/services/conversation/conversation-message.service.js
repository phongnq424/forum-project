const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { emitToChat, emitToUser } = require("../../socket/emitter");
const { NotificationService } = require("../notification.service");
const { CloudinaryService } = require("../cloudinary.service");

function getAttachmentFileType(file) {
    const mime = file.mimetype || "";

    if (mime.startsWith("image/")) {
        return "IMAGE";
    }

    if (mime.startsWith("video/")) {
        return "VIDEO";
    }

    const documentMimes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain"
    ];

    if (documentMimes.includes(mime)) {
        return "DOCUMENT";
    }

    return "OTHER";
}

function buildAttachmentResponse(attachment) {
    const result = {
        id: attachment.id,
        message_id: attachment.message_id,
        userId: attachment.userId,
        file_type: attachment.file_type,
        original_name: attachment.original_name,
        mime_type: attachment.mime_type,
        size: attachment.size,
        uploaded_at: attachment.uploaded_at
    };

    if (attachment.file_type === "IMAGE") {
        result.url = CloudinaryService.signedAuthenticatedUrl(
            attachment.public_id,
            attachment.resource_type,
            600
        );
    }

    if (
        attachment.file_type === "DOCUMENT" &&
        attachment.mime_type === "application/pdf" &&
        attachment.resource_type === "image"
    ) {
        result.preview_url = CloudinaryService.signedAuthenticatedUrl(
            attachment.public_id,
            "image",
            600,
            {
                page: 1,
                format: "png",
                width: 420,
                crop: "fit"
            }
        );
    }

    return result;
}

function buildMessageResponse(message) {
    if (!message) return null;

    return {
        id: message.id,
        conversation_id: message.conversation_id,
        sender_id: message.sender_id,
        content: message.content,
        type: message.type || "TEXT",
        call_id: message.call_id || null,
        sent_at: message.sent_at,
        updated_at: message.updated_at,
        is_read: message.is_read,
        is_deleted: message.is_deleted,
        deleted_at: message.deleted_at,
        sender: message.Sender
            ? {
                id: message.Sender.id,
                username: message.Sender.username,
                fullname: message.Sender.fullname,
                avatar: message.Sender.avatar
            }
            : null,
        attachments: message.Attachment || []
    };
}

async function uploadChatFiles(files, conversationId) {
    const uploaded = [];

    try {
        for (const file of files) {
            const result = await CloudinaryService.uploadAuthenticated(
                file.path,
                `chat/${conversationId}`
            );

            uploaded.push({
                public_id: result.public_id,
                resource_type: result.resource_type,
                delivery_type: "authenticated",
                file_type: getAttachmentFileType(file),
                original_name: file.originalname,
                mime_type: file.mimetype,
                size: file.size
            });
        }

        return uploaded;
    } catch (error) {
        await Promise.all(
            uploaded.map((item) =>
                item.public_id
                    ? CloudinaryService.delete(item.public_id, {
                        resource_type: item.resource_type,
                        type: "authenticated"
                    }).catch(() => { })
                    : Promise.resolve()
            )
        );

        throw error;
    }
}

async function rollbackUploadedFiles(uploadedFiles) {
    await Promise.all(
        uploadedFiles.map((item) =>
            item.public_id
                ? CloudinaryService.delete(item.public_id, {
                    resource_type: item.resource_type,
                    type: "authenticated"
                }).catch(() => { })
                : Promise.resolve()
        )
    );
}

async function createMessageWithAttachments(
    tx,
    conversationId,
    senderId,
    content,
    uploadedFiles
) {
    const message = await tx.message.create({
        data: {
            conversation_id: conversationId,
            sender_id: senderId,
            content: content || "",
            Attachment:
                uploadedFiles.length > 0
                    ? {
                        create: uploadedFiles.map((file) => ({
                            userId: senderId,
                            file_path: file.public_id,
                            public_id: file.public_id,
                            resource_type: file.resource_type,
                            delivery_type: file.delivery_type,
                            file_type: file.file_type,
                            original_name: file.original_name,
                            mime_type: file.mime_type,
                            size: file.size
                        }))
                    }
                    : undefined
        },
        include: {
            Sender: {
                select: {
                    id: true,
                    username: true,
                    fullname: true,
                    avatar: true,
                    Profile: true
                }
            },
            Attachment: true
        }
    });

    return buildMessageResponse(message);
}

async function createMessageAndUpdateConversation(
    tx,
    conversationId,
    senderId,
    content,
    uploadedFiles
) {
    const message = await createMessageWithAttachments(
        tx,
        conversationId,
        senderId,
        content,
        uploadedFiles
    );

    await tx.conversation.update({
        where: { id: conversationId },
        data: {
            last_message_id: message.id,
            last_message_at: message.sent_at
        }
    });

    return message;
}

const ConversationMessageService = {
    getMessagesByConversation: async (
        conversationId,
        userId,
        { viewerId, blockContext } = {}
    ) => {
        const conv = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                ConversationUser: true
            }
        });

        if (!conv) {
            throw new Error("Conversation not found");
        }

        const isMember = conv.ConversationUser.some(
            (u) => u.user_id === userId && u.left_at === null
        );

        if (!isMember) {
            throw new Error("Forbidden");
        }

        if (conv.type === "CHAT") {
            const otherUserId = conv.ConversationUser.find(
                (u) => u.user_id !== userId
            )?.user_id;

            if (otherUserId && blockContext?.blockedSet?.has(otherUserId)) {
                throw new Error("User is blocked");
            }
        }

        const messages = await prisma.message.findMany({
            where: {
                conversation_id: conversationId,
                is_deleted: false
            },
            include: {
                Sender: {
                    select: {
                        id: true,
                        username: true,
                        fullname: true,
                        avatar: true,
                        Profile: true
                    }
                },
                Attachment: true
            },
            orderBy: {
                sent_at: "asc"
            }
        });

        await prisma.message.updateMany({
            where: {
                conversation_id: conversationId,
                is_read: false,
                is_deleted: false,
                sender_id: {
                    not: userId
                }
            },
            data: {
                is_read: true
            }
        });

        emitToChat(conversationId, "chat:read", {
            conversationId,
            userId
        });

        return messages.map(buildMessageResponse);
    },

    sendMessage: async (
        conversationId,
        senderId,
        content,
        { blockContext, socketId = null, files = [] } = {}
    ) => {
        const conv = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                ConversationUser: true
            }
        });

        if (!conv) {
            throw new Error("Conversation not found");
        }

        const isMember = conv.ConversationUser.some(
            (u) => u.user_id === senderId && u.left_at === null
        );

        if (!isMember) {
            throw new Error("Forbidden");
        }

        const otherUserId = conv.ConversationUser.find(
            (u) => u.user_id !== senderId
        )?.user_id;

        if (conv.type === "CHAT" && blockContext?.blockedSet?.has(otherUserId)) {
            throw new Error("User is blocked");
        }

        const uploadedFiles =
            files.length > 0 ? await uploadChatFiles(files, conversationId) : [];

        let message;

        try {
            message = await prisma.$transaction(async (tx) => {
                return await createMessageAndUpdateConversation(
                    tx,
                    conversationId,
                    senderId,
                    content,
                    uploadedFiles
                );
            });
        } catch (error) {
            await rollbackUploadedFiles(uploadedFiles);
            throw error;
        }

        emitToChat(conversationId, "chat:message:new", message, socketId);

        const users = conv.ConversationUser.filter(
            (u) => u.user_id !== senderId && !u.left_at
        );

        users.forEach((u) => {
            emitToUser(u.user_id, "chat:message:new", {
                conversationId,
                message
            });
        });
        if (conv.type === "CHAT" && otherUserId) {
            const senderName =
                message.Sender?.fullname ||
                message.Sender?.username ||
                "Someone";

            NotificationService.create({
                user_id: otherUserId,
                actor_id: senderId,
                type: "MESSAGE",
                title: `${senderName} sent you a message`,
                message: content || (uploadedFiles.length > 0 ? "Sent a file" : ""),
                ref_id: conversationId
            }).catch(console.error);
        }


        return message;
    }
};

module.exports = {
    ConversationMessageService,
    buildMessageResponse,
    uploadChatFiles,
    rollbackUploadedFiles,
    createMessageAndUpdateConversation
};