const { Router } = require("express");
const { ReportController } = require("../controllers/report.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");

const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, ReportController.create);

router.get(
    "/",
    verifyToken,
    requireRole("ADMIN"),
    ReportController.list
);

router.get(
    "/:id",
    verifyToken,
    requireRole("ADMIN"),
    ReportController.getById
);

router.put(
    "/:id",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ReportController.updateStatus
);

router.post(
    "/:id/replies",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ReportController.reply
);

router.delete(
    "/:id",
    rateLimitMiddleware,
    verifyToken,
    requireRole("ADMIN"),
    ReportController.delete
);

module.exports = router;