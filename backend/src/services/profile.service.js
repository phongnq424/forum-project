const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ProfileService = {
    getProfileByUserId: async (userId) => {
        return await prisma.profile.findUnique({
            where: { user_id: userId },
            include: {
                User: {
                    select: {
                        InterestedTopic: {
                            include: {
                                Topic: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        created_at: true
                    }
                }
            }
        })
    },

    updateProfile: async (userId, data) => {
        const existing = await prisma.profile.findUnique({ where: { user_id: userId } })

        if (data.dob && typeof data.dob === 'string') {
            data.dob = new Date(data.dob)
        }

        if (!existing)
            return await prisma.profile.create({ data: { ...data, user_id: userId } })

        return await prisma.profile.update({ where: { user_id: userId }, data })
    },


    list: async (query) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit

        const [profiles, total] = await Promise.all([
            prisma.profile.findMany({
                skip,
                take: limit,
                include: {
                    User: {

                        select: {
                            InterestedTopic: {
                                include: {
                                    Topic: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            },
                            id: true,
                            username: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.profile.count()
        ])

        return {
            data: profiles,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    searchUsers: async (query) => {
        return await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { Profile: { fullname: { contains: query, mode: 'insensitive' } } },
                    { Profile: { location: { contains: query, mode: 'insensitive' } } }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                Profile: {
                    select: {
                        fullname: true,
                        avatar: true,
                        bio: true,
                        location: true
                    }
                }
            },
            take: 20
        })
    }
}

module.exports = { ProfileService }
