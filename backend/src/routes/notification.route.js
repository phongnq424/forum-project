const { Router } = require('express')
const { NotificationController } = require('../controllers/notification.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')

const router = Router()

router.get('/', verifyToken, NotificationController.list)
router.get('/unread-count', verifyToken, NotificationController.unreadCount)
router.patch('/:id/read', rateLimitMiddleware, verifyToken, NotificationController.markRead)
router.patch('/read-all', rateLimitMiddleware, verifyToken, NotificationController.markAllRead)

module.exports = router
