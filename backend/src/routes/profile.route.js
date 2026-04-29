const { Router } = require('express');
const { ProfileController } = require('../controllers/profile.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { verifyTokenOptional } = require("../middlewares/auth.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.get('/me', verifyToken, ProfileController.getMyProfile)
router.get('/search/all', cache, ProfileController.searchUsers)
router.get('/', ProfileController.listProfiles)
router.get('/:userId', verifyTokenOptional, ProfileController.getProfileByUserId)
router.put('/me', rateLimitMiddleware, verifyToken, ProfileController.updateMyProfile)

module.exports = router;
