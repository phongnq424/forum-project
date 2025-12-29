const { Router } = require("express");
const { BlockController } = require("../controllers/block.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.post(
  "/toggle",
  rateLimitMiddleware,
  verifyToken,
  BlockController.toggleBlock
);
router.get(
  "/blocked",
  rateLimitMiddleware,
  verifyToken,
  BlockController.getBlockedUsers
);

module.exports = router;
