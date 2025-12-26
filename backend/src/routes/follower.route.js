const { Router } = require("express");
const { FollowerController } = require("../controllers/follower.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

router.post("/toggle", rateLimitMiddleware, verifyToken, FollowerController.toggleFollow); //
router.delete("/remove", verifyToken, FollowerController.removeFollower); //
router.get("/followers/:userId", cache, FollowerController.getFollowers); //
router.get("/following/:userId", cache, FollowerController.getFollowing); //

module.exports = router;
