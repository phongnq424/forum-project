const { Router } = require("express");
const { PostController } = require("../controllers/post.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, PostController.createPost); //
router.get("/", PostController.list); //
router.get("/search", PostController.search);
router.get("/user/:userId", PostController.getByUser); //
router.get("/:id", PostController.getPost); //
router.put("/:id", rateLimitMiddleware, verifyToken, PostController.updatePost); //
router.delete("/:id", verifyToken, PostController.deletePost); //

module.exports = router;
