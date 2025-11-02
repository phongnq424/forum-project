const { FollowerService } = require('../services/follower.service')

const FollowerController = {
    toggleFollow: async (req, res) => {
        try {
            const currentUserId = req.user.id
            const { targetUserId } = req.body
            const result = await FollowerService.toggleFollow(currentUserId, targetUserId)
            res.status(200).json(result)
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    },
    removeFollower: async (req, res) => {
        try {
            const currentUserId = req.user.id
            const { followerId } = req.body
            const result = await FollowerService.removeFollower(currentUserId, followerId)
            res.status(200).json(result)
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    },

    getFollowers: async (req, res) => {
        try {
            const userId = req.params.userId
            const result = await FollowerService.getFollowers(userId, req.query)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    },

    getFollowing: async (req, res) => {
        try {
            const userId = req.params.userId
            const result = await FollowerService.getFollowing(userId, req.query)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { FollowerController }
