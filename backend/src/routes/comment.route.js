const { Router } = require("express");
const { CommentController } = require("../controllers/comment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, CommentController.create); //
router.get("/post/:postId", CommentController.listByPost); //
router.put(
  "/:commentId",
  rateLimitMiddleware,
  verifyToken,
  CommentController.update
);
router.delete("/:commentId", verifyToken, CommentController.delete); //

module.exports = router;
