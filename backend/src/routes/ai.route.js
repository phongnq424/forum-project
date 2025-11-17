const { Router } = require('express')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { AIController } = require('../controllers/ai.controller')

const router = Router()

router.post('/chat', rateLimitMiddleware, verifyToken, AIController.chat)

module.exports = router
