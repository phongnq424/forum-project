const { Router } = require('express');
const { UserController } = require('../controllers/user.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRole } = require('../middlewares/role.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')

const router = Router();

router.get('/', UserController.listUsers)
router.get('/me', verifyToken, UserController.getMe)
router.get('/:id', UserController.getUserById)
router.put('/me', rateLimitMiddleware, verifyToken, UserController.updateMe)
router.put('/me/password', rateLimitMiddleware, verifyToken, UserController.changePassword)
router.put('/:id', rateLimitMiddleware, verifyToken, UserController.updateUser)
router.delete('/:id', verifyToken, UserController.deleteUser)

module.exports = router

