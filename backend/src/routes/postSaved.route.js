const { Router } = require('express')
const { PostSavedController } = require('../controllers/postSaved.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

const router = Router()

router.post('/toggle/:postId', verifyToken, PostSavedController.toggleSave)
router.get('/', verifyToken, PostSavedController.getSavedPosts)

module.exports = router
