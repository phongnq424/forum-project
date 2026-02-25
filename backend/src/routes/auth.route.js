const { Router } = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware');
const { verifyToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const authValidation = require('../validations/auth.validation');

const router = Router();

router.post("/send-otp", rateLimitMiddleware, validate(authValidation.emailOnly), AuthController.sendOtp);
router.post("/resend-otp", rateLimitMiddleware, validate(authValidation.emailOnly), AuthController.resendOtp);
router.post("/verify-otp", rateLimitMiddleware, validate(authValidation.verifyOtp), AuthController.verifyOtp);
router.post("/check-exist", rateLimitMiddleware, validate(authValidation.checkExist), AuthController.checkExistUser);
router.post("/register", rateLimitMiddleware, validate(authValidation.register), AuthController.register);
router.post("/login", rateLimitMiddleware, validate(authValidation.login), AuthController.login);
router.get("/me", verifyToken, AuthController.getMe);
router.post("/refresh", AuthController.refresh);
router.post("/logout", verifyToken, AuthController.logout);

module.exports = router;