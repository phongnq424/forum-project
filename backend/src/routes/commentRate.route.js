const { Router } = require('express')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { CommentRateController } = require('../controllers/commentRate.controller')

const router = Router()

router.post('/rate', rateLimitMiddleware, verifyToken, CommentRateController.rateComment)
router.get('/user/:commentId', verifyToken, CommentRateController.getUserRating)
router.get('/stats/:commentId', CommentRateController.getCommentStats)
router.get('/my', verifyToken, CommentRateController.getUserRatings)
router.get('/all/:commentId', verifyToken, CommentRateController.getAllRatingsByComment)

module.exports = router
