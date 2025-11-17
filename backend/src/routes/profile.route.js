const { Router } = require('express');
const { ProfileController } = require('../controllers/profile.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { verifyTokenOptional } = require("../middlewares/auth.middleware");

const router = Router();

router.get('/me', verifyToken, ProfileController.getMyProfile)
router.get('/:userId', verifyTokenOptional, ProfileController.getProfileByUserId)
router.put('/me', rateLimitMiddleware, verifyToken, ProfileController.updateMyProfile)
router.get('/', ProfileController.listProfiles)
router.get('/search/all', ProfileController.searchUsers)

module.exports = router
