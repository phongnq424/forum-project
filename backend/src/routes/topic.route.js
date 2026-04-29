const { Router } = require("express");
const { TopicController } = require("../controllers/topic.controller");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");
const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, requireRole("ADMIN"), TopicController.createMany);
router.get("/", TopicController.list);
router.get("/:id", TopicController.getById);
router.put("/:id", rateLimitMiddleware, verifyToken, requireRole("ADMIN"), TopicController.update);
router.delete("/", rateLimitMiddleware, verifyToken, requireRole("ADMIN"), TopicController.deleteMany);

module.exports = router;
