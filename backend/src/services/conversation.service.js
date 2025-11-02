const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ConversationService = {
    createChat: async (userIds) => {
        if (userIds.length !== 2) throw new Error('Chat must have 2 users')

        const existing = await prisma.conversation.findFirst({
            where: { type: 'CHAT' },
            include: { ConversationUser: true }
        })

        if (existing) return existing

        return prisma.conversation.create({
            data: {
                type: 'CHAT',
                ConversationUser: { create: userIds.map(id => ({ user_id: id })) }
            },
            include: { ConversationUser: true }
        })
    },

    createGroup: async (name, avatar, userIds) => {
        return prisma.conversation.create({
            data: {
                type: 'GROUP',
                name,
                avatar,
                ConversationUser: { create: userIds.map(id => ({ user_id: id })) }
            },
            include: { ConversationUser: true }
        })
    },

    listUserConversations: async (userId) => {
        const conversations = await prisma.conversationUser.findMany({
            where: { user_id: userId, left_at: null },
            include: {
                Conversation: {
                    include: {
                        ConversationUser: {
                            include: { User: { select: { id: true, username: true, Profile: true } } }
                        },
                        Message: { orderBy: { sent_at: 'desc' }, take: 1 }
                    }
                }
            },
            orderBy: { joined_at: 'desc' }
        })

        return conversations.map(cu => {
            const conv = cu.Conversation
            const latestMsg = conv.Message[0] || null
            const unreadCount = conv.Message.filter(m => !m.is_read && m.sender_id !== userId).length
            return { ...conv, latestMsg, unreadCount }
        })
    },

    getMessagesByConversation: async (conversationId, userId) => {
        const messages = await prisma.message.findMany({
            where: { conversation_id: conversationId },
            include: { Sender: { select: { id: true, username: true, Profile: true } }, Attachment: true },
            orderBy: { sent_at: 'asc' }
        })

        // Đánh dấu tất cả message chưa đọc thành đã đọc (trừ sender)
        await prisma.message.updateMany({
            where: { conversation_id: conversationId, is_read: false, sender_id: { not: userId } },
            data: { is_read: true }
        })

        return messages
    },

    sendMessage: async (conversationId, senderId, content) => {
        return prisma.message.create({
            data: { conversation_id: conversationId, sender_id: senderId, content },
            include: { Sender: { select: { id: true, username: true, Profile: true } }, Attachment: true }
        })
    },

    leaveConversation: async (conversationId, userId) => {
        return prisma.conversationUser.updateMany({
            where: { conversation_id: conversationId, user_id: userId },
            data: { left_at: new Date() }
        })
    }
}

module.exports = { ConversationService }