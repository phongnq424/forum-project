const { Router } = require('express')
const { InterestedTopicController } = require('../controllers/interestedTopic.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const router = Router()

router.post('/', verifyToken, InterestedTopicController.follow)
router.delete('/:topicId', verifyToken, InterestedTopicController.unfollow)
router.get('/me', verifyToken, InterestedTopicController.getMyTopics)

module.exports = router
