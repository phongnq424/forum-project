const { NotificationService } = require('../services/notification.service');

const NotificationController = {
    list: async (req, res) => {
        try {
            const userId = req.user.id
            const result = await NotificationService.listByUser(userId, req.query)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    },
    unreadCount: async (req, res) => {
        try {
            const userId = req.user.id
            const count = await NotificationService.countUnread(userId)
            res.status(200).json(count)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    },
    markRead: async (req, res) => {
        try {
            const userId = req.user.id
            const { id } = req.params
            await NotificationService.markRead(userId, id)
            res.sendStatus(204)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    },

    markAllRead: async (req, res) => {
        try {
            const userId = req.user.id
            await NotificationService.markAllRead(userId)
            res.sendStatus(204)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

module.exports = { NotificationController }