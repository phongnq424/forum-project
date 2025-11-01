const { Router } = require('express')
const { CommentController } = require('../controllers/comment.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/', verifyToken, CommentController.create)
router.get('/post/:postId', CommentController.listByPost)
router.put('/:commentId', verifyToken, CommentController.update)
router.delete('/:commentId', verifyToken, CommentController.delete)

module.exports = router
