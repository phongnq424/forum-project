const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PostService = {
    createPost: async (userId, data) => {
        return await prisma.post.create({
            data: { ...data, user_id: userId },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        Profile: { select: { avatar: true } }
                    }
                },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } }
            }
        })
    },

    getPostById: async (postId) => {
        return await prisma.post.findUnique({
            where: { id: postId },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        Profile: { select: { avatar: true } }
                    }
                },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } },
                Comment: {
                    select: {
                        id: true,
                        comment_detail: true,
                        user_id: true,
                        created_at: true,
                        User: {
                            select: {
                                id: true,
                                username: true,
                                Profile: { select: { avatar: true } }
                            }
                        }
                    },
                    take: 50
                },
                Reaction: { select: { id: true, type: true, user_id: true } }
            }
        })
    },

    updatePost: async (userId, postId, data) => {
        const existing = await prisma.post.findUnique({ where: { id: postId } })
        if (!existing) throw new Error('Post not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        return await prisma.post.update({
            where: { id: postId },
            data,
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        Profile: { select: { avatar: true } }
                    }
                },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } }
            }
        })
    },

    deletePost: async (userId, postId) => {
        const existing = await prisma.post.findUnique({ where: { id: postId } })
        if (!existing) throw new Error('Post not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        await prisma.image.deleteMany({ where: { post_id: postId } })
        return await prisma.post.delete({ where: { id: postId } })
    },

    list: async (query) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit
        const where = {}
        if (query.topic_id) where.topic_id = query.topic_id
        if (query.user_id) where.user_id = query.user_id

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    User: {
                        select: {
                            id: true,
                            username: true,
                            Profile: { select: { avatar: true } }
                        }
                    },
                    Topic: { select: { id: true, name: true } },
                    Image: { select: { id: true, url: true } }
                }
            }),
            prisma.post.count({ where })
        ])

        return {
            data: posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    getByUser: async (userId, query) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: { user_id: userId },
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    Topic: { select: { id: true, name: true } },
                    Image: { select: { id: true, url: true } }
                }
            }),
            prisma.post.count({ where: { user_id: userId } })
        ])

        return {
            data: posts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    },

    searchPosts: async (q) => {
        const query = q || ''
        return await prisma.post.findMany({
            where: {
                OR: [
                    { content: { contains: query, mode: 'insensitive' } },
                    { Topic: { name: { contains: query, mode: 'insensitive' } } },
                    { User: { username: { contains: query, mode: 'insensitive' } } }
                ]
            },
            take: 50,
            orderBy: { created_at: 'desc' },
            include: {
                User: {
                    select: {
                        id: true,
                        username: true,
                        Profile: { select: { avatar: true } }
                    }
                },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } }
            }
        })
    }
}

module.exports = { PostService }
