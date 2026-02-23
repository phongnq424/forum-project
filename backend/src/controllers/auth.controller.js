const { AuthService } = require("../services/auth/auth.service");

const AuthController = {
    sendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: "Email is required" });

            await AuthService.sendOtp(email);
            return res.status(200).json({ message: "OTP sent successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    resendOtp: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email)
                return res.status(400).json({ error: "Email is required" });

            await AuthService.resendOtp(email);
            return res.status(200).json({ message: "OTP resent successfully" });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) return res.status(400).json({ error: "Email or OTP is missing" });

            const result = await AuthService.verifyOtp(email, otp);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const { email, username, password } = req.body;

            if (!email || !username || !password)
                return res.status(400).json({ error: "Please fill in all required fields" });

            const result = await AuthService.register({ email, username, password }, req);

            return res.status(201).json(result);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const result = await AuthService.login(username, password, req);

            return res.status(200).json({
                message: "Login successful",
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
            if (!refreshToken)
                return res.status(400).json({ error: "Refresh token is required" });

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
            return res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },

    checkExistUser: async (req, res) => {
        try {
            await AuthService.checkExistUser(req.body);
            return res.status(200).json({ message: "User can be created" });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },
};

module.exports = { AuthController };