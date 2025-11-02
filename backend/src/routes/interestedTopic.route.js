const { Router } = require('express')
const { InterestedTopicController } = require('../controllers/interestedTopic.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const router = Router()

router.post('/', rateLimitMiddleware, verifyToken, InterestedTopicController.follow)
router.delete('/:topicId', verifyToken, InterestedTopicController.unfollow)
router.get('/me', verifyToken, InterestedTopicController.getMyTopics)

module.exports = router
