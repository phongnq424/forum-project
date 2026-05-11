const { Router } = require('express');
const { ChallengeController } = require('../controllers/challenge.controller');
const { verifyToken, verifyTokenOptional } = require('../middlewares/auth.middleware');
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post('/', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.create);
router.get('/', verifyTokenOptional, ChallengeController.list);
router.get('/:id', verifyTokenOptional, ChallengeController.getById);
router.put('/:id', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.update);
router.delete('/:id', rateLimitMiddleware, verifyToken, requireRole('ADMIN'), ChallengeController.delete);
module.exports = router
