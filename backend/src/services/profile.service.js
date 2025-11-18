const { PrismaClient } = require('@prisma/client');
const { CloudinaryService } = require('./cloudinary.service')
const prisma = new PrismaClient();

const ProfileService = {
    getProfileByUserId: async (userId, viewerId = null) => {
        const profile = await prisma.profile.findUnique({
            where: { user_id: userId },
            include: {
                User: {
                    select: {
                        InterestedTopic: {
                            select: {
                                id: true,
                                topic_id: true,
                                Topic: { select: { name: true } }
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

        if (!profile) return null

        const [postCount, commentCount, followingCount, followerCount] = await Promise.all([
            prisma.post.count({ where: { user_id: userId } }),
            prisma.comment.count({ where: { user_id: userId } }),
            prisma.follower.count({ where: { follow_id: userId } }), // số người user follow
            prisma.follower.count({ where: { followed_id: userId } }) // số người follow user
        ])

        let isFollowing = false
        if (viewerId) {
            const follow = await prisma.follower.findUnique({
                where: { follow_id_followed_id: { follow_id: viewerId, followed_id: userId } }
            })
            isFollowing = !!follow
        }

        return {
            ...profile,
            postCount,
            commentCount,
            followingCount,
            followerCount,
            isFollowing
        }
    },

    updateProfile: async (userId, data, files = {}) => {
        const existing = await prisma.profile.findUnique({ where: { user_id: userId } })

        if (data.dob && typeof data.dob === 'string') {
            data.dob = new Date(data.dob)
        }

        if (files.avatar) {
            const uploadedAvatar = await CloudinaryService.update(
                files.avatar,
                'avatar',
                existing?.avatarPublicId
            );
            data.avatar = uploadedAvatar.url;
            data.avatarPublicId = uploadedAvatar.public_id;
        }

        if (files.cover) {
            const uploadedCover = await CloudinaryService.update(
                files.cover,
                'cover',
                existing?.coverPublicId
            );
            data.cover = uploadedCover.url;
            data.coverPublicId = uploadedCover.public_id;
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
                                select: {
                                    id: true,
                                    topic_id: true,
                                    Topic: {
                                        select: { name: true }
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
