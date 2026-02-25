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
                        fullname: true,
                        avatar: true,
                        created_at: true,
                        _count: {
                            select: {
                                Post: true,
                                Comment: true,
                                FollowerFollowed: true,
                                FollowerFollow: true
                            }
                        }
                    }
                }
            }
        })

        if (!profile) return null

        let isFollowing = false
        if (viewerId) {
            const follow = await prisma.follower.findUnique({
                where: { follow_id_followed_id: { follow_id: viewerId, followed_id: userId } }
            })
            isFollowing = !!follow
        }

        return {
            ...profile,
            postCount: profile.User._count.Post,
            commentCount: profile.User._count.Comment,
            followingCount: profile.User._count.FollowerFollowed,
            followerCount: profile.User._count.FollowerFollow,
            isFollowing
        }
    },

    updateProfile: async (userId, data, files = {}) => {
        const profile = await prisma.profile.findUnique({ where: { user_id: userId } })
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (data.dob === "") {
            data.dob = null;
        }
        else if (data.dob && typeof data.dob === 'string') {
            data.dob = new Date(data.dob)
        }

        if (data.gender === "") {
            data.gender = null;
        }

        // Upload avatar → lưu vào User table
        if (files.avatar) {
            const uploadedAvatar = await CloudinaryService.update(
                files.avatar,
                'avatar',
                user?.avatar_public_id
            );
            await prisma.user.update({
                where: { id: userId },
                data: {
                    avatar: uploadedAvatar.url,
                    avatar_public_id: uploadedAvatar.public_id
                }
            });
        }

        // Upload cover → lưu vào Profile table
        if (files.cover) {
            const uploadedCover = await CloudinaryService.update(
                files.cover,
                'cover',
                profile?.cover_public_id
            );
            data.cover = uploadedCover.url;
            data.cover_public_id = uploadedCover.public_id;
        }

        // Update fullname vào User table nếu được gửi
        if (data.fullname) {
            await prisma.user.update({
                where: { id: userId },
                data: { fullname: data.fullname }
            });
            delete data.fullname; // remove khỏi Profile data
        }

        if (!profile)
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
                            email: true,
                            fullname: true,
                            avatar: true
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
                    { fullname: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                fullname: true,
                avatar: true
            },
            take: 20
        })
    }
}

module.exports = { ProfileService }
