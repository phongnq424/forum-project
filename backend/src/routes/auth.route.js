const { Router } = require('express');
const { AuthController } = require('../controllers/auth.controller')
const { rateLimitMiddleware } = require('../middlewares/rateLimit.middleware');

const router = Router();

router.post("/send-otp", rateLimitMiddleware, AuthController.sendOtp)
router.post("/resend-otp", rateLimitMiddleware, AuthController.resendOtp)
router.post("/verify-otp", rateLimitMiddleware, AuthController.verifyOtp)
router.post("/check-exist", rateLimitMiddleware, AuthController.checkExistUser)
router.post("/register", rateLimitMiddleware, AuthController.register)
router.post("/login", rateLimitMiddleware, AuthController.login)
router.post("/logout", rateLimitMiddleware, AuthController.logout)
router.post("/login-google", rateLimitMiddleware, AuthController.loginGoogle)

module.exports = router

