const { PrismaClient } = require('@prisma/client')
const { CloudinaryService } = require('./cloudinary.service')
const { BlockService } = require('./block.service')
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

                await prisma.image.createMany({ data: uploaded.map(i => ({ url: i.url, post_id: i.post_id })) })
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

    getPostById: async (postId, viewerId = null) => {
        const post = await prisma.post.findUnique({
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

        if (!post) return null

        if (viewerId && viewerId !== post.User.id) {
            await BlockService.ensureNotBlocked(viewerId, post.User.id)
        }

        const commentCount = await prisma.comment.count({ where: { post_id: postId } })
        const reactionCount = await prisma.reaction.count({ where: { post_id: postId } })
        let isSaved = false
        if (viewerId) {
            const s = await prisma.postSaved.findUnique({
                where: { user_id_post_id: { user_id: viewerId, post_id: postId } }
            })
            isSaved = !!s
        }

        return {
            ...post,
            commentCount,
            reactionCount,
            isSaved
        }
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
                await prisma.image.createMany({ data: uploaded.map(i => ({ url: i.url, post_id: i.post_id })) })
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

    list: async (query, viewerId = null) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit
        const where = {}
        if (query.topic_id) where.topic_id = query.topic_id
        if (query.user_id) where.user_id = query.user_id
        if (query.category_id) {
            const topics = await prisma.topic.findMany({ where: { category_id: query.category_id }, select: { id: true } })
            where.topic_id = { in: topics.map(t => t.id) }
        }

        if (viewerId) {
            const blocked = await prisma.block.findMany({
                where: { blocker_id: viewerId },
                select: { blocked_id: true }
            })
            const blockedSet = new Set(blocked.map(b => b.blocked_id))
            if (!where.user_id) where.user_id = { notIn: Array.from(blockedSet) }
        }

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

        if (posts.length === 0) {
            return {
                data: [],
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
            }
        }

        const postIds = posts.map(p => p.id)

        const commentGroups = await prisma.comment.groupBy({
            by: ['post_id'],
            where: { post_id: { in: postIds } },
            _count: { _all: true }
        })

        const reactionGroups = await prisma.reaction.groupBy({
            by: ['post_id'],
            where: { post_id: { in: postIds } },
            _count: { _all: true }
        })

        let savedSet = new Set()
        if (viewerId) {
            const saved = await prisma.postSaved.findMany({
                where: { user_id: viewerId, post_id: { in: postIds } },
                select: { post_id: true }
            })
            savedSet = new Set(saved.map(s => s.post_id))
        }

        const commentMap = new Map(commentGroups.map(g => [g.post_id, g._count._all]))
        const reactionMap = new Map(reactionGroups.map(g => [g.post_id, g._count._all]))

        const data = posts.map(p => ({
            ...p,
            commentCount: commentMap.get(p.id) || 0,
            reactionCount: reactionMap.get(p.id) || 0,
            isSaved: savedSet.has(p.id)
        }))

        return {
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    },

    getByUser: async (userIdOwner, query, viewerId = null) => {
        if (viewerId && viewerId !== userIdOwner) {
            await BlockService.ensureNotBlocked(viewerId, userIdOwner)
        }
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit

        const where = { user_id: userIdOwner }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    Topic: { select: { id: true, name: true } },
                    Image: { select: { id: true, url: true } }
                }
            }),
            prisma.post.count({ where })
        ])

        if (posts.length === 0) {
            return {
                data: [],
                pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
            }
        }

        const postIds = posts.map(p => p.id)

        const [commentGroups, reactionGroups, saved] = await Promise.all([
            prisma.comment.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
            prisma.reaction.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
            viewerId ? prisma.postSaved.findMany({ where: { user_id: viewerId, post_id: { in: postIds } }, select: { post_id: true } }) : []
        ])

        const commentMap = new Map(commentGroups.map(g => [g.post_id, g._count._all]))
        const reactionMap = new Map(reactionGroups.map(g => [g.post_id, g._count._all]))
        const savedSet = new Set(saved.map(s => s.post_id))

        const data = posts.map(p => ({
            ...p,
            commentCount: commentMap.get(p.id) || 0,
            reactionCount: reactionMap.get(p.id) || 0,
            isSaved: savedSet.has(p.id)
        }))

        return {
            data,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        }
    },

    searchPosts: async (q, viewerId = null) => {
        const query = q || ''
        const posts = await prisma.post.findMany({
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

        if (posts.length === 0) return []
        if (viewerId) {
            const blocked = await prisma.block.findMany({
                where: {
                    OR: [
                        { blocker_id: viewerId },
                        { blocked_id: viewerId }
                    ]
                },
                select: { blocker_id: true, blocked_id: true }
            })
            const blockedSet = new Set()
            blocked.forEach(b => {
                if (b.blocker_id === viewerId) blockedSet.add(b.blocked_id)
                if (b.blocked_id === viewerId) blockedSet.add(b.blocker_id)
            })
            posts = posts.filter(p => !blockedSet.has(p.user_id))
        }

        const postIds = posts.map(p => p.id)

        const [commentGroups, reactionGroups, saved] = await Promise.all([
            prisma.comment.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
            prisma.reaction.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
            viewerId ? prisma.postSaved.findMany({ where: { user_id: viewerId, post_id: { in: postIds } }, select: { post_id: true } }) : []
        ])

        const commentMap = new Map(commentGroups.map(g => [g.post_id, g._count._all]))
        const reactionMap = new Map(reactionGroups.map(g => [g.post_id, g._count._all]))
        const savedSet = new Set(saved.map(s => s.post_id))

        return posts.map(p => ({
            ...p,
            commentCount: commentMap.get(p.id) || 0,
            reactionCount: reactionMap.get(p.id) || 0,
            isSaved: savedSet.has(p.id)
        }))
    }
}

module.exports = { PostService }
