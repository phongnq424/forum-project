const { Router } = require("express");
const {
  SubmissionController,
} = require("../controllers/submission.controller");
const {
  verifyToken,
  verifyInternalToken,
} = require("../middlewares/auth.middleware");
const { cache } = require("../middlewares/cache.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { requireRole } = require("../middlewares/role.middleware");

const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, SubmissionController.submit);
router.get("/:id", verifyToken, cache, SubmissionController.getById);
router.get(
  "/challenge/:challenge_id",
  cache,
  SubmissionController.listByChallenge
);
router.get("/user", verifyToken, cache, SubmissionController.listByUser);
router.get(
  "/user/challenge/:challenge_id",
  verifyToken,
  cache,
  SubmissionController.listByUserAndChallenge
);
router.post("/result", verifyInternalToken, SubmissionController.receiveResult);

module.exports = router;
