const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const BlockService = {
    toggleBlock: async (currentUserId, targetUserId) => {
        if (currentUserId === targetUserId) {
            throw new Error('Cannot block yourself')
        }

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
        }

        await prisma.$transaction([
            prisma.block.create({
                data: {
                    blocker_id: currentUserId,
                    blocked_id: targetUserId
                }
            }),
            prisma.follower.deleteMany({
                where: {
                    OR: [
                        {
                            follow_id: currentUserId,
                            followed_id: targetUserId
                        },
                        {
                            follow_id: targetUserId,
                            followed_id: currentUserId
                        }
                    ]
                }
            })
        ])

        return { blocked: true }
    },

    getBlockedUsers: async (userId, query) => {
        const take = parseInt(query.limit) || 50
        const page = parseInt(query.page) || 1
        const skip = (page - 1) * take

        const where = {
            blocker_id: userId
        }
        if (query.search) {
            where.Blocked = {
                username: {
                    contains: query.search,
                    mode: 'insensitive'
                }
            }
        }

        const blockedUsers = await prisma.block.findMany({
            where,
            skip,
            take,
            include: {
                Blocked: {
                    select: {
                        id: true,
                        username: true,
                        Profile: {
                            select: { avatar: true }
                        }
                    }
                }
            }
        })

        const total = await prisma.block.count({ where })

        return {
            data: blockedUsers.map(b => b.Blocked),
            pagination: {
                total,
                page,
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        }
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
            throw new Error('Blocked interaction')
        }
    },

    getBlockedUserIds: async (userId) => {
        const blocks = await prisma.block.findMany({
            where: {
                OR: [
                    { blocker_id: userId },
                    { blocked_id: userId }
                ]
            },
            select: {
                blocker_id: true,
                blocked_id: true
            }
        })

        return blocks.map(b =>
            b.blocker_id === userId ? b.blocked_id : b.blocker_id
        )
    }
}

module.exports = { BlockService }
