const { Router } = require("express");
const { PostSavedController } = require("../controllers/postSaved.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.post(
  "/toggle/:postId", rateLimitMiddleware, verifyToken, PostSavedController.toggleSave);
router.get("/", verifyToken, cache, PostSavedController.getSavedPosts);

module.exports = router;
