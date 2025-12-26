const { Router } = require('express');
const { ChallengeController } = require('../controllers/challenge.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.post('/', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.create);
router.get('/', cache, ChallengeController.list);
router.get('/:id', cache, ChallengeController.getById);
router.put('/:id', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.update);
router.delete('/:id', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.delete);
module.exports = router
