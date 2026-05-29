const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { emitToChat, emitToUser } = require("../socket/emitter");
const { NotificationService } = require("./notification.service");
const RedisOnlineService = require("./redisOnline.service");
const redisClient = require("../config/redis");

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
            scope: conv.scope,
            topic_id: conv.topic_id,
            challenge_id: conv.challenge_id,
            ConversationUser: {
              where: {
                User: {
                  is_deleted: false,
                  status: "ACTIVE",
                }
              },
              include: {
                User: {
                  select: { id: true, username: true, avatar: true, fullname: true }
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
          .map((cu) => cu.User)
          .find((u) => u.id !== userId);

        if (peer) peerIds.push(peer.id);
      }
    });
    const onlineKeys = peerIds.map((id) => `online:user:${id}`);
    const onlineResults =
      onlineKeys.length > 0 ? await redisClient.mget(onlineKeys) : [];

    const onlineMap = {};
    peerIds.forEach((id, i) => {
      onlineMap[id] = !!onlineResults[i];
    });

    return rows.map((cu) => {
      const conv = cu.Conversation;
      const peerUser =
        conv.type === "CHAT"
          ? conv.ConversationUser.map((cu) => cu.User).find(
            (u) => u.id !== userId
          )
          : null;
      return {
        conversationId: conv.id,
        type: conv.type,
        name: conv.type === "GROUP" ? conv.name : null,
        avatar:
          conv.type === "GROUP"
            ? conv.avatar
            : peerUser.avatar || null,

        peer: peerUser
          ? {
            id: peerUser.id,
            username: peerUser.username,
            fullname: peerUser?.fullname,
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
        Attachment: true,
      },
      orderBy: { sent_at: "asc" },
    });

    await prisma.message.updateMany({
      where: {
        conversation_id: conversationId,
        is_read: false,
        is_deleted: false,
        sender_id: { not: userId },
      },
      data: { is_read: true },
    });

    // 🔥 emit read
    emitToChat(conversationId, "chat:read", {
      conversationId,
      userId,
    });

    return messages;
  },

  sendMessage: async (conversationId, senderId, content, { blockContext, socketId = null }) => {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { ConversationUser: true },
    });

    if (!conv) throw new Error("Conversation not found");

    const otherUserId = conv.ConversationUser.find(
      (u) => u.user_id !== senderId
    )?.user_id;

    if (conv.type === "CHAT" && blockContext?.blockedSet?.has(otherUserId)) {
      throw new Error("User is blocked");
    }

    const message = await prisma.message.create({
      data: { conversation_id: conversationId, sender_id: senderId, content },
      include: {
        Sender: { select: { id: true, username: true, Profile: true } },
        Attachment: true,
      },
    });


    emitToChat(conversationId, "chat:message:new", message, socketId);

    const users = conv.ConversationUser.filter(
      (u) => u.user_id !== senderId && !u.left_at
    );
    //eachUser ngoại trừ user hiện tại
    users.forEach((u) => {

      emitToUser(u.user_id, "chat:message:new", {
        conversationId,
        message,
      });
    });

    if (conv.type === "CHAT") {
      NotificationService.create({
        user_id: otherUserId,
        actor_id: senderId,
        type: "MESSAGE",
        title: "Tin nhắn mới",
        message: content,
        ref_id: conversationId,
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
    { blockContext } = {}
  ) => {
    // 1. block check
    if (blockContext?.blockedSet?.has(toUserId)) {
      throw new Error("User is blocked");
    }

    // 2. tìm chat 1-1 cũ
    let conversation = await prisma.conversation.findFirst({
      where: {
        type: "CHAT",
        ConversationUser: {
          every: {
            user_id: { in: [fromUserId, toUserId] },
          },
        },
      },
      include: { ConversationUser: true },
    });

    // 3. chưa có thì create
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          type: "CHAT",
          ConversationUser: {
            create: [{ user_id: fromUserId }, { user_id: toUserId }],
          },
        },
        include: { ConversationUser: true },
      });

      // emit chat mới
      emitToUser(fromUserId, "chat:new", conversation);
      emitToUser(toUserId, "chat:new", conversation);
    }

    // 4. tạo message
    const message = await prisma.message.create({
      data: {
        conversation_id: conversation.id,
        sender_id: fromUserId,
        content,
      },
      include: {
        Sender: {
          select: { id: true, username: true, Profile: true },
        },
        Attachment: true,
      },
    });

    // 5. emit message
    emitToChat(conversation.id, "chat:message:new", message);

    emitToUser(toUserId, "chat:message:new", {
      conversationId: conversation.id,
      message,
    });

    return {
      conversationId: conversation.id,
      message,
    };
  },
};

module.exports = { ConversationService };
