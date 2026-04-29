const { PostSavedService } = require('../services/postSaved.service')
const { buildBlockContext } = require('../contexts/block.context')

const PostSavedController = {
    toggleSave: async (req, res) => {
        try {
            const userId = req.user.id
            const postId = req.params.postId
            const result = await PostSavedService.toggleSave(userId, postId)
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    },

    getSavedPosts: async (req, res) => {
        try {
            const userId = req.user.id
            const blockContext = await buildBlockContext(userId)
            const result = await PostSavedService.getSavedPosts(userId, req.query, { blockContext })
            return res.status(200).json(result)
        } catch (e) {
            return res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { PostSavedController }
