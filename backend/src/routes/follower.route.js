const { Router } = require('express')
const { FollowerController } = require('../controllers/follower.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')

const router = Router()

router.post('/toggle', rateLimitMiddleware, verifyToken, FollowerController.toggleFollow)
router.delete('/remove', verifyToken, FollowerController.removeFollower)
router.get('/followers/:userId', FollowerController.getFollowers)
router.get('/following/:userId', FollowerController.getFollowing)

module.exports = router
