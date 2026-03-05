const { Router } = require("express");
const { UserController } = require("../controllers/user.controller");
const { AdminUserController } = require("../controllers/admin.user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const { rateLimitMiddleware } = require("../middlewares/rateLimit.middleware");
const { cache } = require("../middlewares/cache.middleware");

const router = Router();

// LUỒNG CỦA USER THƯỜNG (Public / Personal)
router.get("/", verifyToken, cache, UserController.listUsers);
router.get("/me", verifyToken, cache, UserController.getMe);
router.put("/me", rateLimitMiddleware, verifyToken, UserController.updateMe);
router.put("/me/password", rateLimitMiddleware, verifyToken, UserController.changePassword);
router.get("/:id", verifyToken, cache, UserController.getUserById);

// LUỒNG CỦA ADMIN (Gắn middleware role 1 lần cho chắc)
const adminRouter = Router();
adminRouter.use(verifyToken, requireRole("ADMIN"));
adminRouter.put("/users/:id", rateLimitMiddleware, AdminUserController.updateUser);
adminRouter.delete("/users/:id", AdminUserController.deleteUser);
adminRouter.get("/users", AdminUserController.listUsers)

router.use("/admin", adminRouter);

module.exports = router;