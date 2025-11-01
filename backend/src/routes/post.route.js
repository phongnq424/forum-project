const { Router } = require('express');
const { PostController } = require('../controllers/post.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/', verifyToken, PostController.createPost)
router.get('/', PostController.list)
router.get('/search', PostController.search)
router.get('/user/:userId', PostController.getByUser)
router.get('/:id', PostController.getPost)
router.put('/:id', verifyToken, PostController.updatePost)
router.delete('/:id', verifyToken, PostController.deletePost)

module.exports = router