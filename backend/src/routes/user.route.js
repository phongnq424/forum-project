const { Router } = require('express');
const { UserController } = require('../controllers/user.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRole } = require('../middlewares/role.middleware')

const router = Router();

router.get('/', UserController.listUsers)
router.get('/me', verifyToken, UserController.getMe)
router.get('/:id', UserController.getUserById)
router.put('/me', verifyToken, UserController.updateMe)
router.put('/me/password', UserController.changePassword)
router.put('/:id', UserController.updateUser)
router.delete('/:id', UserController.deleteUser)

module.exports = router

