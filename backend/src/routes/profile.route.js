const { Router } = require('express');
const { ProfileController } = require('../controllers/profile.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware')
const { verifyTokenOptional } = require("../middlewares/auth.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.get('/me', verifyToken, cache, ProfileController.getMyProfile)
router.get('/:userId', verifyTokenOptional, cache, ProfileController.getProfileByUserId)
router.put('/me', rateLimitMiddleware, verifyToken, ProfileController.updateMyProfile)
router.get('/', cache, ProfileController.listProfiles)
router.get('/search/all', cache, ProfileController.searchUsers)

module.exports = router;
