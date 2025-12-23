const { ReactionService } = require('../services/reaction.service')

const ReactionController = {
    toggle: async (req, res) => {
        try {
            const userId = req.user.id
            const { postId, type } = req.query
            const result = await ReactionService.toggleReaction(userId, postId, type)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    },

    listByPost: async (req, res) => {
        try {
            const reactions = await ReactionService.getReactionsByPost(req.params.postId)
            res.status(200).json(reactions)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { ReactionController }
