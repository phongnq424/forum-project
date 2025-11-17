const { Router } = require('express');
const { PostController } = require('../controllers/post.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { verifyTokenOptional } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')

const router = Router();

router.post('/', rateLimitMiddleware, verifyToken, PostController.createPost)
router.get('/', verifyTokenOptional, PostController.list)
router.get('/search', verifyTokenOptional, PostController.search)
router.get('/user/:userId', verifyTokenOptional, PostController.getByUser)
router.get('/:id', verifyTokenOptional, PostController.getPost)
router.put('/:id', rateLimitMiddleware, verifyToken, PostController.updatePost)
router.delete('/:id', verifyToken, PostController.deletePost)

module.exports = router;
