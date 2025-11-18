const { Router } = require("express");
const { ReactionController } = require("../controllers/reaction.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post("/toggle", rateLimitMiddleware, verifyToken, ReactionController.toggle);
router.get("/post/:postId", ReactionController.listByPost);

module.exports = router;
