const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PostSavedService = {
    toggleSave: async (userId, postId) => {
        const existing = await prisma.postSaved.findUnique({
            where: { user_id_post_id: { user_id: userId, post_id: postId } }
        })

        if (existing) {
            await prisma.postSaved.delete({
                where: { user_id_post_id: { user_id: userId, post_id: postId } }
            })
            return { saved: false }
        } else {
            const saved = await prisma.postSaved.create({
                data: { user_id: userId, post_id: postId }
            })
            return { saved: true, postSaved: saved }
        }
    },

    getSavedPosts: async (userId, query) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit
        const search = query.q || ''

        const where = {
            user_id: userId,
            Post: {
                OR: [
                    { content: { contains: search, mode: 'insensitive' } },
                    { Topic: { name: { contains: search, mode: 'insensitive' } } },
                    { User: { username: { contains: search, mode: 'insensitive' } } }
                ]
            }
        }

        const [posts, total] = await Promise.all([
            prisma.postSaved.findMany({
                where,
                skip,
                take: limit,
                orderBy: { saved_at: 'desc' },
                include: {
                    Post: {
                        include: {
                            User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                            Topic: { select: { id: true, name: true } },
                            Image: { select: { id: true, url: true } }
                        }
                    }
                }
            }),
            prisma.postSaved.count({ where })
        ])

        return {
            data: posts.map(p => p.Post),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    }
}

module.exports = { PostSavedService }
