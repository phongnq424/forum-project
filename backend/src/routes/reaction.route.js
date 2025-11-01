const { Router } = require('express')
const { ReactionController } = require('../controllers/reaction.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const router = Router()

router.get('/toggle', verifyToken, ReactionController.toggle)
router.get('/post/:postId', ReactionController.listByPost)

module.exports = router
