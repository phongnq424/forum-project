const { Router } = require("express");
const { CategoryController } = require("../controllers/category.controller");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRole } = require("../middlewares/role.middleware");
const router = Router();

router.post("/", rateLimitMiddleware, verifyToken, requireRole('ADMIN'), CategoryController.createMany);
router.get("/", CategoryController.list); //
router.get("/:id", CategoryController.getById);
router.put("/:id", rateLimitMiddleware, verifyToken, requireRole('ADMIN'), CategoryController.update);
router.delete("/", rateLimitMiddleware, verifyToken, requireRole('ADMIN'), CategoryController.deleteMany);

module.exports = router;
