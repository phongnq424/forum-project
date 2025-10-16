const { Router } = require('express');
const { AuthController } = require('../controllers/auth.controller')

const router = Router();

router.post("/send-otp", AuthController.sendOtp)
router.post("/resend-otp", AuthController.resendOtp)
router.post("/verify-otp", AuthController.verifyOtp)
router.post("/check-exist", AuthController.checkExistUser)
router.post("/register", AuthController.register)
router.post("/login", AuthController.login)
router.post("/logout", AuthController.logout)
router.post("/login-google", AuthController.loginGoogle)

module.exports = router

