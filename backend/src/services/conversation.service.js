const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { emitToChat, emitToUser } = require("../socket/emitter");
const { NotificationService } = require("./notification.service");
const RedisOnlineService = require("./redisOnline.service");
const redisClient = require("../config/redis");
const fs = require("fs");
const { CloudinaryService } = require("./cloudinary.service");

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

async function removeLocalFiles(files) {
  await Promise.all(
    files.map((file) =>
      file.path
        ? fs.promises.unlink(file.path).catch(() => { })
        : Promise.resolve()
    )
  );
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

async function createMessageWithAttachments(tx, conversationId, senderId, content, uploadedFiles) {
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
      Sender: { select: { id: true, username: true, Profile: true } },
      Attachment: true
    }
  });

  return buildMessageResponse(message);
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
  if (!message) return message;

  return {
    ...message,
    Attachment: message.Attachment
      ? message.Attachment.map(buildAttachmentResponse)
      : []
  };
}

const ConversationService = {
  createChat: async (userIds, { viewerId, blockContext } = {}) => {
    if (userIds.length !== 2) throw new Error("Chat must have 2 users");

    const otherUserId = userIds.find((id) => id !== viewerId);
    if (blockContext?.blockedSet?.has(otherUserId)) {
      throw new Error("User is blocked");
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        type: "CHAT",
        ConversationUser: {
          every: { user_id: { in: userIds } },
        },
      },
      include: { ConversationUser: true },
    });

    if (existing) return existing;

    const conversation = await prisma.conversation.create({
      data: {
        type: "CHAT",
        ConversationUser: {
          create: userIds.map((id) => ({ user_id: id })),
        },
      },
      include: { ConversationUser: true },
    });

    userIds.forEach((uid) => {
      emitToUser(uid, "chat:new", conversation);
    });

    return conversation;
  },

  createGroup: async ({
    name,
    avatar,
    userIds,
    ownerId,
    scope = "GENERAL",
    topic_id = null,
    challenge_id = null
  }) => {
    const conversation = await prisma.conversation.create({
      data: {
        type: "GROUP",
        scope,
        name,
        avatar,
        topic_id,
        challenge_id,
        ConversationUser: {
          create: userIds.map((id) => ({
            user_id: id,
            role: id === ownerId ? "OWNER" : "MEMBER"
          }))
        }
      },
      include: {
        Topic: {
          select: { id: true, name: true, slug: true }
        },
        Challenge: {
          select: { id: true, title: true, difficulty: true, type: true }
        },
        ConversationUser: true
      }
    });

    userIds.forEach((uid) => {
      emitToUser(uid, "chat:new", conversation);
    });

    return conversation;
  },

  listUserConversations: async (userId, { viewerId, blockContext } = {}) => {
    const blockedIds = blockContext?.blockedUserIds
      ? Array.from(blockContext.blockedUserIds)
      : [];

    const rows = await prisma.conversationUser.findMany({
      where: {
        user_id: userId,
        left_at: null,
        Conversation: {
          OR: [
            { type: "GROUP" },
            {
              type: "CHAT",
              ConversationUser: {
                none: { user_id: { in: blockedIds } },
              },
            },
          ],
        },
      },
      include: {
        Conversation: {
          include: {
            ConversationUser: {
              where: {
                User: {
                  is_deleted: false,
                  status: "ACTIVE",
                },
              },
              include: {
                User: {
                  select: {
                    id: true,
                    username: true,
                    avatar: true,
                    fullname: true,
                  },
                },
              },
            },
            Message: {
              where: { is_deleted: false },
              orderBy: { sent_at: "desc" },
              take: 1,
            },
            _count: {
              select: {
                Message: {
                  where: {
                    is_deleted: false,
                    is_read: false,
                    sender_id: { not: userId },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { joined_at: "desc" },
    });

    const peerIds = [];

    rows.forEach((cu) => {
      const conv = cu.Conversation;

      if (conv.type === "CHAT") {
        const peer = conv.ConversationUser
          .map((item) => item.User)
          .find((u) => u.id !== userId);

        if (peer) peerIds.push(peer.id);
      }
    });

    const onlineKeys = peerIds.map((id) => `online:user:${id}`);

    let onlineResults = [];

    try {
      onlineResults =
        onlineKeys.length > 0 ? await redisClient.mget(onlineKeys) : [];
    } catch (error) {
      console.error(
        "[ConversationService] Redis online check failed:",
        error.message
      );
      onlineResults = [];
    }

    const onlineMap = {};

    peerIds.forEach((id, i) => {
      onlineMap[id] = !!onlineResults[i];
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
            online: onlineMap[peerUser.id] || false,
          }
          : null,

        latestMsg: conv.Message[0] || null,
        unreadCount: conv._count.Message,
      };
    });
  },

  getMessagesByConversation: async (
    conversationId,
    userId,
    { viewerId, blockContext } = {}
  ) => {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { ConversationUser: true },
    });
    if (!conv) throw new Error("Conversation not found");

    const isMember = conv.ConversationUser.some(
      (u) => u.user_id === userId && u.left_at === null
    );
    if (!isMember) throw new Error("Forbidden");

    if (conv.type === "CHAT") {
      const otherUserId = conv.ConversationUser.find(
        (u) => u.user_id !== userId
      )?.user_id;

      if (otherUserId && blockContext?.blockedSet?.has(otherUserId)) {
        throw new Error("User is blocked");
      }
    }
    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId, is_deleted: false },
      include: {
        Sender: { select: { id: true, username: true, Profile: true } },
        Attachment: true
      },
      orderBy: { sent_at: "asc" }
    });

    await prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        is_read: false,
        is_deleted: false,
        sender_id: { not: userId }
      },
      data: { is_read: true }
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
      where: { id: conversationId },
      include: { ConversationUser: true }
    });

    if (!conv) throw new Error("Conversation not found");

    const isMember = conv.ConversationUser.some(
      (u) => u.user_id === senderId && u.left_at === null
    );

    if (!isMember) throw new Error("Forbidden");

    const otherUserId = conv.ConversationUser.find(
      (u) => u.user_id !== senderId
    )?.user_id;

    if (conv.type === "CHAT" && blockContext?.blockedSet?.has(otherUserId)) {
      throw new Error("User is blocked");
    }

    const uploadedFiles = files.length > 0
      ? await uploadChatFiles(files, conversationId)
      : [];

    let message;

    try {
      message = await prisma.$transaction(async (tx) => {
        return await createMessageWithAttachments(
          tx,
          conversationId,
          senderId,
          content,
          uploadedFiles
        );
      });
    } catch (error) {
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

    if (conv.type === "CHAT") {
      NotificationService.create({
        user_id: otherUserId,
        actor_id: senderId,
        type: "MESSAGE",
        title: "Tin nhắn mới",
        message: content || (uploadedFiles.length > 0 ? "Đã gửi một tệp đính kèm" : ""),
        ref_id: conversationId
      }).catch(console.error);
    }

    return message;
  },

  leaveConversation: async (conversationId, userId) => {
    await prisma.conversationUser.updateMany({
      where: { conversation_id: conversationId, user_id: userId },
      data: { left_at: new Date() },
    });

    emitToChat(conversationId, "chat:left", {
      conversationId,
      userId,
    });

    return { left: true };
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
            user_id: { in: [fromUserId, toUserId] }
          }
        }
      },
      include: { ConversationUser: true }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: "CHAT",
          ConversationUser: {
            create: [{ user_id: fromUserId }, { user_id: toUserId }]
          }
        },
        include: { ConversationUser: true }
      });

      emitToUser(fromUserId, "chat:new", conversation);
      emitToUser(toUserId, "chat:new", conversation);
    }

    const uploadedFiles = files.length > 0
      ? await uploadChatFiles(files, conversation.id)
      : [];

    let message;

    try {
      message = await prisma.$transaction(async (tx) => {
        return await createMessageWithAttachments(
          tx,
          conversation.id,
          fromUserId,
          content,
          uploadedFiles
        );
      });
    } catch (error) {
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
      title: "Tin nhắn mới",
      message: content || (uploadedFiles.length > 0 ? "Đã gửi một tệp đính kèm" : ""),
      ref_id: conversation.id
    }).catch(console.error);

    return {
      conversationId: conversation.id,
      message
    };
  },
};

module.exports = { ConversationService };
