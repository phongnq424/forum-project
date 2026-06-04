const { PrismaClient } = require('@prisma/client');
const { CloudinaryService } = require('./cloudinary.service')
const prisma = new PrismaClient();

const ProfileService = {
    getProfileByUserId: async (userId, viewerId = null) => {
        // 1. Lấy profile và thông tin cơ bản trước
        const profile = await prisma.profile.findUnique({
            where: { user_id: userId },
            include: {
                User: {
                    select: {
                        InterestedTopic: { /* ... giữ nguyên ... */ },
                        id: true, username: true, email: true,
                        role: true, fullname: true, avatar: true, created_at: true
                    }
                }
            }
        });

        if (!profile) return null;
        const canEdit = viewerId === userId;
        // 2. Chạy tất cả các lệnh đếm có filter is_deleted song song
        const [postCount, commentCount, followingCount, followerCount, follow] = await Promise.all([
            prisma.post.count({
                where: { user_id: userId, is_deleted: false }
            }),
            prisma.comment.count({
                where: { user_id: userId, is_deleted: false }
            }),
            prisma.follower.count({
                where: { follow_id: userId }
            }),
            prisma.follower.count({
                where: { followed_id: userId }
            }),
            viewerId ? prisma.follower.findUnique({
                where: { follow_id_followed_id: { follow_id: viewerId, followed_id: userId } }
            }) : null
        ]);

        return {
            ...profile,
            postCount,
            commentCount,
            followingCount,
            followerCount,
            isFollowing: !!follow,
            canEdit
        };
    },

    updateProfile: async (userId, data, files = {}) => {
        const [profile, user] = await Promise.all([
            prisma.profile.findUnique({ where: { user_id: userId } }),
            prisma.user.findUnique({ where: { id: userId } })
        ])

        const userUpdateData = {}

        if (Object.prototype.hasOwnProperty.call(data, 'fullname')) {
            userUpdateData.fullname = data.fullname && data.fullname.trim()
                ? data.fullname.trim()
                : null

            delete data.fullname
        }

        delete data.avatar
        delete data.avatar_public_id

        if (data.dob === "") {
            data.dob = null
        } else if (data.dob && typeof data.dob === 'string') {
            data.dob = new Date(data.dob)
        }

        if (data.gender === "") {
            data.gender = null
        }

        const uploadPromises = []
        let uploadedAvatar = null
        let uploadedCover = null

        if (files.avatar) {
            uploadPromises.push(
                CloudinaryService.update(
                    files.avatar,
                    'avatar',
                    user && user.avatar_public_id
                ).then(function (uploaded) {
                    uploadedAvatar = uploaded
                })
            )
        }

        if (files.cover) {
            uploadPromises.push(
                CloudinaryService.update(
                    files.cover,
                    'cover',
                    profile && profile.cover_public_id
                ).then(function (uploaded) {
                    uploadedCover = uploaded
                })
            )
        }

        if (uploadPromises.length > 0) {
            await Promise.all(uploadPromises)
        }

        if (uploadedAvatar) {
            userUpdateData.avatar = uploadedAvatar.url
            userUpdateData.avatar_public_id = uploadedAvatar.public_id
        }

        if (uploadedCover) {
            data.cover = uploadedCover.url
            data.cover_public_id = uploadedCover.public_id
        }

        const updatePromises = []

        if (Object.keys(userUpdateData).length > 0) {
            updatePromises.push(
                prisma.user.update({
                    where: { id: userId },
                    data: userUpdateData
                })
            )
        }

        if (!profile) {
            updatePromises.push(
                prisma.profile.create({
                    data: {
                        ...data,
                        user_id: userId
                    }
                })
            )
        } else {
            updatePromises.push(
                prisma.profile.update({
                    where: { user_id: userId },
                    data
                })
            )
        }

        await Promise.all(updatePromises)

        return await prisma.profile.findUnique({
            where: { user_id: userId },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        fullname: true,
                        avatar: true,
                        created_at: true
                    }
                }
            }
        })
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
