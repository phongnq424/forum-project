const { Router } = require('express')
const { FollowerController } = require('../controllers/follower.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/toggle', verifyToken, FollowerController.toggleFollow)
router.delete('/remove', verifyToken, FollowerController.removeFollower)
router.get('/followers/:userId', FollowerController.getFollowers)
router.get('/following/:userId', FollowerController.getFollowing)

module.exports = router
