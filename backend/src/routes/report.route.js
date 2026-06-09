const { Router } = require("express");
const { ReportController } = require("../controllers/report.controller");
const { ModerationController } = require("../controllers/moderation.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post(
    "/",
    rateLimitMiddleware,
    verifyToken,
    ReportController.create
);

router.get(
    "/me",
    verifyToken,
    ReportController.listMine
);

router.get(
    "/cases",
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.listCases
);

router.get(
    "/cases/:id",
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.getCaseById
);

router.post(
    "/cases/:id/assign",
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.assignCase
);

router.post(
    "/cases/:id/action",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.applyAction
);

router.post(
    "/cases/:id/resolve",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.resolveCase
);

router.post(
    "/cases/:id/close",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ModerationController.closeCase
);

module.exports = router;