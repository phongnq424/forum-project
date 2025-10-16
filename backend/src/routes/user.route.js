const { Router } = require('express');
const { UserController } = require('../controllers/user.controller')

const router = Router();

router.get('/', UserController.listUsers)
router.get('/me', UserController.getMe)
router.get('/:id', UserController.getUserById)
router.put('/me', UserController.updateMe)
router.put('/me/password', UserController.changePassword)
router.put('/:id', UserController.updateUser)
router.delete('/:id', UserController.deleteUser)

module.exports = router

