const { CommentRateService } = require('../services/commentRate.service')

const CommentRateController = {
    rateComment: async (req, res) => {
        try {
            const userId = req.user.id
            const { commentId, rating } = req.body
            if (!commentId || typeof rating !== 'number')
                return res.status(400).json({ error: 'Invalid input' })

            const result = await CommentRateService.rateComment(userId, commentId, rating)
            res.json(result)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    getAllRatingsByComment: async (req, res) => {
        try {
            const { commentId } = req.params
            const ratings = await CommentRateService.getAllRatingsByComment(commentId)
            res.json(ratings)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },
    getUserRating: async (req, res) => {
        try {
            const userId = req.user.id
            const { commentId } = req.params
            const rating = await CommentRateService.getUserRating(userId, commentId)
            res.json(rating)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    getCommentStats: async (req, res) => {
        try {
            const { commentId } = req.params
            const stats = await CommentRateService.getCommentStats(commentId)
            res.json(stats)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    getUserRatings: async (req, res) => {
        try {
            const userId = req.user.id
            const ratings = await CommentRateService.getUserRatings(userId)
            res.json(ratings)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = { CommentRateController }
