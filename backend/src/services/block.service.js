const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const BlockService = {
    toggleBlock: async (currentUserId, targetUserId) => {
        if (currentUserId === targetUserId) throw new Error("Cannot block yourself")

        const existing = await prisma.block.findUnique({
            where: {
                blocker_id_blocked_id: {
                    blocker_id: currentUserId,
                    blocked_id: targetUserId
                }
            }
        })

        if (existing) {
            await prisma.block.delete({
                where: {
                    blocker_id_blocked_id: {
                        blocker_id: currentUserId,
                        blocked_id: targetUserId
                    }
                }
            })
            return { blocked: false }
        } else {
            await prisma.block.create({
                data: {
                    blocker_id: currentUserId,
                    blocked_id: targetUserId
                }
            })
            return { blocked: true }
        }
    },

    getBlockedUsers: async (userId, query) => {
        const take = parseInt(query.limit) || 50
        const skip = parseInt(query.page ? (query.page - 1) * take : 0)
        const where = { blocked_id: userId }
        if (query.search) where.blocker = { username: { contains: query.search, mode: 'insensitive' } }
        const blockedUsers = await prisma.block.findMany({
            where,
            skip,
            take,
            include: { blocker: { select: { id: true, username: true, Profile: { select: { avatar: true } } } } }
        })
        const total = await prisma.block.count({ where })
        return { data: blockedUsers, pagination: { total, page: parseInt(query.page) || 1, limit: take, totalPages: Math.ceil(total / take) } }
    },

    ensureNotBlocked: async (userA, userB) => {
        const isBlocked = await prisma.block.findFirst({
            where: {
                OR: [
                    { blocker_id: userA, blocked_id: userB },
                    { blocker_id: userB, blocked_id: userA }
                ]
            }
        })

        if (isBlocked) {
            throw new Error("Blocked interaction")
        }
    }
}

module.exports = { BlockService }
