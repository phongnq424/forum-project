const { AuthService } = require("../services/auth/auth.service");

const AuthController = {
    sendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: "Email là bắt buộc" });

            await AuthService.sendOtp(email);
            return res.status(200).json({ message: "Gửi mã OTP thành công" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },
    resendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) return res.status(400).json({ error: "Email là bắt buộc" });

            await AuthService.resendOtp(email);
            return res.status(200).json({ message: "Gửi lại mã OTP thành công" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) return res.status(400).json({ error: "Thiếu Email hoặc OTP" });

            await AuthService.verifyOtp(email, otp);
            const user = await AuthService.createUserFromCache(email);

            return res.status(201).json({
                message: "Xác thực và đăng ký thành công",
                user
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const { email, username, password, role } = req.body;
            if (!email || !username || !password)
                return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
            await AuthService.checkExistUser({ email, username });
            await AuthService.cacheTempUser({ email, username, password, role });
            await AuthService.sendOtp(email);

            return res.status(200).json({
                message: "Mã OTP đã được gửi. Vui lòng xác thực để hoàn tất."
            });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const result = await AuthService.login(username, password, req);

            return res.status(200).json({
                message: "Đăng nhập thành công",
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
                user: result.user
            });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },

    refresh: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(400).json({ error: "Refresh token là bắt buộc" });

            const result = await AuthService.refresh(refreshToken, req);

            return res.status(200).json(result);
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },


    logout: async (req, res) => {
        try {
            const { refreshToken } = req.body;
            await AuthService.logout(refreshToken);
            return res.status(200).json({ message: "Đăng xuất thành công" });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },
    checkExistUser: async (req, res) => {
        try {
            await AuthService.checkExistUser(req.body)
            return res.status(200).json({ message: "Can create new user" })
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    },
};

module.exports = { AuthController };