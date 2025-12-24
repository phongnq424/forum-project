const { PostService } = require('../services/post.service')
const { upload } = require('../middlewares/upload.middleware')
const { validateFiles } = require('../validators/file.validator')
const { buildBlockContext } = require('../contexts/block.context')

const PostController = {
    createPost: [
        upload.fields([{ name: 'images', maxCount: 5 }]),
        async (req, res) => {
            try {
                if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

                validateFiles(req.files, ['images'])
                const files = req.files?.images || []
                const { content, topic_id, title } = req.body

                const newPost = await PostService.createPost(req.user.id, {
                    content,
                    topic_id,
                    title,
                    files
                })

                return res.status(201).json(newPost)
            } catch (error) {
                const status = error.message && error.message.toLowerCase().includes('invalid') ? 400 : 500
                return res.status(status).json({ error: error.message })
            }
        }
    ],

    getPost: async (req, res) => {
        try {
            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)
            const post = await PostService.getPostById(req.params.id, { viewerId, blockContext })
            if (!post) return res.status(404).json({ message: 'Post not found' })
            return res.status(200).json(post)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    updatePost: [
        upload.fields([{ name: 'images', maxCount: 5 }]),
        async (req, res) => {
            try {
                if (!req.user?.id) return res.status(401).json({ error: 'Unauthorized' })

                validateFiles(req.files, ['images'])
                const files = req.files?.images || []
                const postId = req.params.id
                const userId = req.user.id
                const { content, topic_id, title, removeImageIds } = req.body
                const removeIds = removeImageIds
                    ? (Array.isArray(removeImageIds) ? removeImageIds : String(removeImageIds).split(',').map(s => s.trim()).filter(Boolean))
                    : []

                const updated = await PostService.updatePost(userId, postId, {
                    content,
                    topic_id,
                    title,
                    files,
                    removeImageIds: removeIds
                })

                return res.status(200).json(updated)
            } catch (e) {
                if (e.message?.toLowerCase().includes('not found')) return res.status(404).json({ message: e.message })
                if (e.message?.toLowerCase().includes('unauthorized')) return res.status(403).json({ message: e.message })
                const status = e.message && e.message.toLowerCase().includes('invalid') ? 400 : 500
                return res.status(status).json({ message: e.message })
            }
        }
    ],

    deletePost: async (req, res) => {
        try {
            const userId = req.user.id
            const postId = req.params.id
            await PostService.deletePost(userId, postId)
            return res.status(200).json({ message: 'Deleted' })
        } catch (e) {
            if (e.message?.toLowerCase().includes('not found')) return res.status(404).json({ message: e.message })
            if (e.message?.toLowerCase().includes('unauthorized')) return res.status(403).json({ message: e.message })
            return res.status(500).json({ message: e.message })
        }
    },

    list: async (req, res) => {
        try {
            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)

            const result = await PostService.list(req.query, {
                viewerId,
                blockContext
            })
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    getByUser: async (req, res) => {
        try {
            const ownerId = req.params.userId
            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)
            const result = await PostService.getByUser(
                ownerId,
                req.query,
                { viewerId, blockContext }
            )
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    search: async (req, res) => {
        try {
            const q = req.query.q || ''
            const viewerId = req.user?.id || null
            const blockContext = await buildBlockContext(viewerId)

            const results = await PostService.searchPosts(q, {
                viewerId,
                blockContext
            })
            return res.status(200).json(results)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { PostController }
