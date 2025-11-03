const { PrismaClient } = require('@prisma/client')
const { CloudinaryService } = require('./cloudinary.service')
const prisma = new PrismaClient()

const PostService = {
    createPost: async (userId, payload) => {
        const { content, title, topic_id, files = [] } = payload

        const created = await prisma.post.create({
            data: {
                content: content || '',
                topic_id: topic_id || null,
                user_id: userId,
                title: title || ''
            }
        })

        if (files.length > 0) {
            const uploaded = []
            try {
                for (const f of files) {
                    const u = await CloudinaryService.upload(f.path, 'post')
                    uploaded.push({ url: u.url, public_id: u.public_id, post_id: created.id })
                }

                await prisma.image.createMany({ data: uploaded.map(i => ({ url: i.url, post_id: i.post_id, /* public_id: i.public_id */ })) })
                // if DB has public_id field uncomment above public_id and include it in createMany data
            } catch (err) {
                for (const up of uploaded) {
                    if (up.public_id) await CloudinaryService.delete(up.public_id).catch(() => { })
                }
                throw err
            }
        }

        return await prisma.post.findUnique({
            where: { id: created.id },
            include: {
                User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } }
            }
        })
    },

    getPostById: async (postId) => {
        return await prisma.post.findUnique({
            where: { id: postId },
            include: {
                User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } },
                Comment: {
                    select: {
                        id: true,
                        comment_detail: true,
                        user_id: true,
                        created_at: true,
                        User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } }
                    },
                    take: 50
                },
                Reaction: { select: { id: true, type: true, user_id: true } }
            }
        })
    },

    updatePost: async (userId, postId, payload) => {
        const { content, title, topic_id, files = [], removeImageIds = [] } = payload
        const existing = await prisma.post.findUnique({ where: { id: postId }, include: { Image: true } })
        if (!existing) throw new Error('Post not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        const toDeleteIds = Array.isArray(removeImageIds) ? removeImageIds : []
        const uploadedPublicIds = []

        try {
            if (toDeleteIds.length > 0) {
                const imgs = await prisma.image.findMany({ where: { id: { in: toDeleteIds }, post_id: postId } })
                await prisma.image.deleteMany({ where: { id: { in: toDeleteIds } } })
                for (const img of imgs) {
                    if (img.public_id) await CloudinaryService.delete(img.public_id).catch(() => { })
                }
            }

            if (files.length > 0) {
                const uploaded = []
                for (const f of files) {
                    const u = await CloudinaryService.upload(f.path, 'post')
                    uploaded.push({ url: u.url, public_id: u.public_id, post_id: postId })
                    uploadedPublicIds.push(u.public_id)
                }
                await prisma.image.createMany({ data: uploaded.map(i => ({ url: i.url, post_id: i.post_id, /* public_id: i.public_id */ })) })
            }

            const updated = await prisma.post.update({
                where: { id: postId },
                data: {
                    content: content !== undefined ? content : existing.content,
                    title: title !== undefined ? title : existing.title,
                    topic_id: topic_id !== undefined ? topic_id : existing.topic_id
                },
                include: {
                    User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                    Topic: { select: { id: true, name: true } },
                    Image: { select: { id: true, url: true } }
                }
            })

            return updated
        } catch (err) {
            if (uploadedPublicIds.length > 0) {
                await Promise.all(uploadedPublicIds.map(pid => CloudinaryService.delete(pid).catch(() => { })))
            }
            throw err
        }
    },

    deletePost: async (userId, postId) => {
        const existing = await prisma.post.findUnique({ where: { id: postId }, include: { Image: true } })
        if (!existing) throw new Error('Post not found')
        if (existing.user_id !== userId) throw new Error('Unauthorized')

        const publicIds = existing.Image.map(i => i.public_id).filter(Boolean)
        await prisma.image.deleteMany({ where: { post_id: postId } })
        await prisma.post.delete({ where: { id: postId } })

        for (const pid of publicIds) {
            await CloudinaryService.delete(pid).catch(() => { })
        }

        return
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
                    User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                    Topic: { select: { id: true, name: true } },
                    Image: { select: { id: true, url: true } }
                }
            }),
            prisma.post.count({ where })
        ])

        return {
            data: posts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
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
                    { title: { contains: query, mode: 'insensitive' } },
                    { Topic: { name: { contains: query, mode: 'insensitive' } } },
                    { User: { username: { contains: query, mode: 'insensitive' } } }
                ]
            },
            take: 50,
            orderBy: { created_at: 'desc' },
            include: {
                User: { select: { id: true, username: true, Profile: { select: { avatar: true } } } },
                Topic: { select: { id: true, name: true } },
                Image: { select: { id: true, url: true } }
            }
        })
    }
}

module.exports = { PostService }
