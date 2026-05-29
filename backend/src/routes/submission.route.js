const { Router } = require("express");
const {
  SubmissionController,
} = require("../controllers/submission.controller");
const {
  verifyToken,
  verifyInternalToken,
} = require("../middlewares/auth.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { uploadSubmissionZip } = require("../middlewares/uploadSubmission.middleware");

const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, SubmissionController.submit);
router.post(
  "/zip",
  rateLimitMiddleware,
  verifyToken,
  uploadSubmissionZip.single("file"),
  async (req, res, next) => {
    req.body.kind = "ZIP";
    req.body.file_path = req.file?.path;
    return SubmissionController.submit(req, res, next);
  }
);
router.get("/:id", verifyToken, SubmissionController.getById);
router.get("/challenge/:challenge_id", SubmissionController.listByChallenge);
router.get("/user/:user_id", verifyToken, SubmissionController.listByUser);
router.get("/user/:user_id/challenge/:challenge_id", verifyToken, SubmissionController.listByUserAndChallenge);
router.post("/result", verifyInternalToken, SubmissionController.receiveResult);
router.get("/:id/insight", verifyToken, SubmissionController.getInsight);
router.get("/:id/recommendations", verifyToken, SubmissionController.getRecommendations);


module.exports = router;
