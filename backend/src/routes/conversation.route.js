const { Router } = require('express')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { ChatController } = require('../controllers/chat.controller')
const { GroupController } = require('../controllers/group.controller')

const router = Router()

// CHAT 1-1
router.post('/chat', rateLimitMiddleware, verifyToken, ChatController.createChat)
router.get('/chat/me', verifyToken, ChatController.listChats)
router.get('/chat/:conversationId/messages', verifyToken, ChatController.getMessages)
router.post('/chat/messages', rateLimitMiddleware, verifyToken, ChatController.sendMessage)

// GROUP
router.post('/group', rateLimitMiddleware, verifyToken, GroupController.createGroup)
router.get('/group/me', verifyToken, GroupController.listGroups)
router.get('/group/:conversationId/messages', verifyToken, GroupController.getMessages)
router.post('/group/:conversationId/message', rateLimitMiddleware, verifyToken, GroupController.sendMessage)
router.post('/group/:conversationId/leave', rateLimitMiddleware, verifyToken, GroupController.leaveGroup)

module.exports = router
