const { PostService } = require('../services/post.service')

const PostController = {
    createPost: async function (req, res) {
        try {
            const userId = req.user.id
            const data = req.body
            const post = await PostService.createPost(userId, data)
            return res.status(201).json(post)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    getPost: async function (req, res) {
        try {
            const post = await PostService.getPostById(req.params.id)
            if (!post) return res.status(404).json({ message: 'Post not found' })
            return res.status(200).json(post)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    updatePost: async function (req, res) {
        try {
            const userId = req.user.id
            const postId = req.params.id
            const data = req.body
            const updated = await PostService.updatePost(userId, postId, data)
            return res.status(200).json(updated)
        } catch (e) {
            if (e.message && e.message.toLowerCase().includes('not found')) return res.status(404).json({ message: e.message })
            if (e.message && e.message.toLowerCase().includes('unauthorized')) return res.status(403).json({ message: e.message })
            return res.status(500).json({ message: e.message })
        }
    },

    deletePost: async function (req, res) {
        try {
            const userId = req.user.id
            const postId = req.params.id
            await PostService.deletePost(userId, postId)
            return res.status(200).json({ message: 'Deleted' })
        } catch (e) {
            if (e.message && e.message.toLowerCase().includes('not found')) return res.status(404).json({ message: e.message })
            if (e.message && e.message.toLowerCase().includes('unauthorized')) return res.status(403).json({ message: e.message })
            return res.status(500).json({ message: e.message })
        }
    },

    list: async function (req, res) {
        try {
            const result = await PostService.list(req.query)
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    getByUser: async function (req, res) {
        try {
            const userId = req.params.userId
            const result = await PostService.getByUser(userId, req.query)
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    search: async function (req, res) {
        try {
            const q = req.query.q || ''
            const results = await PostService.searchPosts(q)
            return res.status(200).json(results)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { PostController }
