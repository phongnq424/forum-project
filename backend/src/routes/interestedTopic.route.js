const { Router } = require('express')
const { InterestedTopicController } = require('../controllers/interestedTopic.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { cache } = require("../middlewares/cache.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const router = Router()

router.post('/', rateLimitMiddleware, verifyToken, InterestedTopicController.follow)
router.delete('/:topicId', rateLimitMiddleware, verifyToken, InterestedTopicController.unfollow)
router.get('/me', verifyToken, cache, InterestedTopicController.getMyTopics)

module.exports = router
