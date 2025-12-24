const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { emitToUser } = require('../socket/emitter')

const emitUnreadCount = async (userId) => {
    const count = await prisma.notification.count({
        where: {
            user_id: userId,
            is_read: false
        }
    })

    emitToUser(userId, 'notification:badge', {
        unreadCount: count
    })
}

const NotificationService = {
    create: async (data) => {
        const notification = await prisma.notification.create({
            data: {
                ...data,
                is_read: false
            }
        })

        emitToUser(data.user_id, 'notification:new', notification)

        await emitUnreadCount(data.user_id)

        return notification
    },

    listByUser: async (userId, query) => {
        const take = parseInt(query.limit) || 20
        const page = parseInt(query.page) || 1
        const skip = (page - 1) * take

        const where = {
            user_id: userId,
        }

        if (query.unread === 'true') {
            where.is_read = false
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take
            }),
            prisma.notification.count({ where })
        ])

        return {
            data: notifications,
            pagination: {
                total,
                page,
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        }
    },

    markRead: async (userId, id) => {
        const result = await prisma.notification.updateMany({
            where: {
                id,
                user_id: userId,
                is_read: false
            },
            data: { is_read: true }
        })

        if (result.count > 0) {
            emitToUser(userId, 'notification:read', { id })
            await emitUnreadCount(userId)
        }

        return result
    },

    markAllRead: async (userId) => {
        const result = await prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: { is_read: true }
        })

        if (result.count > 0) {
            emitToUser(userId, 'notification:read:all', {})
            await emitUnreadCount(userId)
        }

        return result
    },

    countUnread: async (userId) => {
        const count = await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        })

        return { unreadCount: count }
    }
}

module.exports = { NotificationService }
