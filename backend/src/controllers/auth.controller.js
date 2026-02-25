const { AuthService } = require("../services/auth/auth.service");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};

const ACCESS_TOKEN_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000 
};

const REFRESH_TOKEN_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000
};

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

            res.cookie('access_token', result.accessToken, ACCESS_TOKEN_OPTIONS);
            res.cookie('refresh_token', result.refreshToken, REFRESH_TOKEN_OPTIONS);
            

            // Return only user, tokens are in HttpOnly cookies
            return res.status(201).json({
                message: "Registration successful",
                user: result.user
            });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const result = await AuthService.login(username, password, req);

            res.cookie('access_token', result.accessToken, ACCESS_TOKEN_OPTIONS);
            res.cookie('refresh_token', result.refreshToken, REFRESH_TOKEN_OPTIONS);

            // Return only user, tokens are in HttpOnly cookies
            return res.status(200).json({
                message: "Login successful",
                user: result.user
            });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },

    refresh: async (req, res) => {
        try {
            // Get refreshToken from cookie
            const refreshToken = req.cookies?.refresh_token;
            if (!refreshToken)
                return res.status(401).json({ error: "Refresh token is required" });

            const result = await AuthService.refresh(refreshToken, req);

            res.cookie('access_token', result.accessToken, ACCESS_TOKEN_OPTIONS);
            res.cookie('refresh_token', result.refreshToken, REFRESH_TOKEN_OPTIONS);

            // Return empty object, tokens are in HttpOnly cookies
            return res.status(200).json({ message: "Token refreshed" });
        } catch (error) {
            res.clearCookie('access_token', COOKIE_OPTIONS);
            res.clearCookie('refresh_token', COOKIE_OPTIONS);
            return res.status(401).json({ error: error.message });
        }
    },

    logout: async (req, res) => {
        try {
            // Get refreshToken from cookie
            const refreshToken = req.cookies?.refresh_token;

            if (refreshToken) {
                await AuthService.logout(refreshToken);
            }

            res.clearCookie('access_token', COOKIE_OPTIONS);
            res.clearCookie('refresh_token', COOKIE_OPTIONS);

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

    getMe: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const user = await prisma.user.findUnique({
                where: { id: req.user.id },
                select: { id: true, username: true, email: true, role: true, avatar: true }
            });

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            return res.status(200).json({ user });
        } catch (error) {
            return res.status(401).json({ error: error.message });
        }
    },
};

module.exports = { AuthController };