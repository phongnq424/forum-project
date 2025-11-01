const { Router } = require('express');
const { ProfileController } = require('../controllers/profile.controller')
const { verifyToken } = require('../middlewares/auth.middleware')


const router = Router();

router.get('/me', verifyToken, ProfileController.getMyProfile)
router.get('/:userId', ProfileController.getProfileByUserId)
router.put('/me', verifyToken, ProfileController.updateMyProfile)
router.get('/', ProfileController.listProfiles)
router.get('/search/all', ProfileController.searchUsers)

module.exports = router
