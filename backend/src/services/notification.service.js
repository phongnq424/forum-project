const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { emitToUser } = require('../socket/emitter')

const SYSTEM_AVATAR_URL = null

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

const enrichNotificationsWithActor = async (notifications) => {
    if (!notifications || notifications.length === 0) {
        return []
    }

    const actorIds = []

    for (const notification of notifications) {
        if (notification.actor_id && !actorIds.includes(notification.actor_id)) {
            actorIds.push(notification.actor_id)
        }
    }

    if (actorIds.length === 0) {
        return notifications.map((notification) => ({
            ...notification,
            actor: null,
            avatarUrl: SYSTEM_AVATAR_URL
        }))
    }

    const actors = await prisma.user.findMany({
        where: {
            id: {
                in: actorIds
            },
            is_deleted: false
        },
        select: {
            id: true,
            username: true,
            fullname: true,
            avatar: true
        }
    })

    const actorMap = new Map()

    for (const actor of actors) {
        actorMap.set(actor.id, actor)
    }

    return notifications.map((notification) => {
        const actor = notification.actor_id
            ? actorMap.get(notification.actor_id) || null
            : null

        return {
            ...notification,
            actor,
            avatarUrl: actor?.avatar || SYSTEM_AVATAR_URL
        }
    })
}

const enrichNotificationWithActor = async (notification) => {
    const result = await enrichNotificationsWithActor([notification])
    return result[0]
}

const NotificationService = {
    create: async (data) => {
        const created = await prisma.notification.create({
            data: {
                ...data,
                is_read: false
            }
        })

        const notification = await enrichNotificationWithActor(created)

        emitToUser(data.user_id, 'notification:new', notification)

        await emitUnreadCount(data.user_id)

        return notification
    },

    listByUser: async (userId, query) => {
        const take = parseInt(query.limit) || 20
        const page = parseInt(query.page) || 1
        const skip = (page - 1) * take

        const where = {
            user_id: userId
        }

        if (query.unread === 'true') {
            where.is_read = false
        }

        const [notifications, total] = await Promise.all([
            prisma.notification.findMany({
                where,
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take
            }),
            prisma.notification.count({
                where
            })
        ])

        const enrichedNotifications = await enrichNotificationsWithActor(notifications)

        return {
            data: enrichedNotifications,
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
            data: {
                is_read: true
            }
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
            data: {
                is_read: true
            }
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

        return {
            unreadCount: count
        }
    }
}

module.exports = { NotificationService }