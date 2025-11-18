const { BlockService } = require('../services/block.service')

const BlockController = {
    toggleBlock: async (req, res) => {
        try {
            const currentUserId = req.user.id
            const { targetUserId } = req.body
            const result = await BlockService.toggleBlock(currentUserId, targetUserId)
            res.status(200).json(result)
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    },

    getBlockedUsers: async (req, res) => {
        try {
            const userId = req.params.userId
            const result = await BlockService.getBlockedUsers(userId, req.query)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { BlockController }
