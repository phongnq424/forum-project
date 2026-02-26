const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendMail } = require('../../config/mailer');
const redisClient = require('../../config/redis');
const {
    generateAccessToken,
    generateRefreshToken,
    hashRefreshToken,
    getDeviceInfo
} = require('./token.utils');

const prisma = new PrismaClient();
const REFRESH_EXPIRY_DAYS = 30;

const AuthService = {

    async _createRefreshToken(userId, deviceInfo = null) {
        const refreshToken = generateRefreshToken();
        const hashed = hashRefreshToken(refreshToken);
        const expiresAt = new Date(Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        await prisma.refreshToken.create({
            data: {
                user_id: userId,
                hashed_token: hashed,
                expires_at: expiresAt,
                device_info: deviceInfo ? JSON.stringify(deviceInfo) : null,
            },
        });

        return refreshToken;
    },

    async _revokeRefreshToken(refreshToken) {
        if (!refreshToken) return;
        const hashed = hashRefreshToken(refreshToken);

        await prisma.refreshToken.updateMany({
            where: { hashed_token: hashed },
            data: { revoked: true, revoked_at: new Date() },
        });
    },

    // --- OTP & Verification ---

    async sendOtp(email) {
        try {
            const existingUser = await prisma.user.findFirst({
                where: { email, is_deleted: false }
            });
            if (existingUser) throw new Error('Email already registered');
            // Using crypto.randomInt for better security than Math.random
            const otp = crypto.randomInt(100000, 1000000).toString();
            console.log(`Generated OTP for ${email}: ${otp}`); // For debugging, remove in production
            await redisClient.set(`otp:${email}`, otp, 'EX', 300); // 5 minutes
            await sendMail(email, "OTP Verification Code", `Your OTP code is: ${otp}`);
            return otp;
        } catch (error) {
            throw new Error('Error sending OTP: ' + error.message);
        }
    },

    async resendOtp(email) {
        try {
            await redisClient.del(`otp:${email}`);
            return await this.sendOtp(email);
        } catch (error) {
            throw new Error('Error resending OTP: ' + error.message);
        }
    },

    async verifyOtp(email, otp) {
        try {
            const savedOtp = await redisClient.get(`otp:${email}`);
            if (!savedOtp) throw new Error('OTP has expired or does not exist');
            if (savedOtp !== otp) throw new Error('Invalid OTP code');

            await redisClient.del(`otp:${email}`);
            // Mark this email as verified to allow registration within the next 10 minutes
            await redisClient.set(`verified:${email}`, 'true', 'EX', 600);

            return { message: 'Email verification successful' };
        } catch (error) {
            throw new Error('OTP verification error: ' + error.message);
        }
    },

    // --- User Registration ---

    async checkExistUser({ email, username }) {
        const existingUser = await prisma.user.findFirst({
            where: {
                is_deleted: false,
                OR: [{ email }, { username }]
            },
        });

        if (existingUser) throw new Error('User or email already exists');
    },

    async register({ email, password, username }, req) {
        try {
            const isVerified = await redisClient.get(`verified:${email}`);
            if (!isVerified) throw new Error('Please verify your email before registering');

            await this.checkExistUser({ email, username });

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email,
                        username,
                        password_hash: hashedPassword,
                        role: 'USER',
                        status: 'ACTIVE'
                    },
                });

                await tx.profile.create({
                    data: { user_id: user.id }
                });

                return user;
            });

            await redisClient.del(`verified:${email}`);

            const deviceInfo = req ? getDeviceInfo(req) : null;
            const refreshToken = await this._createRefreshToken(newUser.id, deviceInfo);
            const accessToken = generateAccessToken(newUser);

            return {
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                },
                accessToken,
                refreshToken
            };
        } catch (error) {
            console.error("Register Error:", error);
            throw new Error(error.message);
        }
    },

    // --- Authentication ---

    async login(username, password, req) {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [{ username }, { email: username }],
                    is_deleted: false
                }
            });

            if (!user) throw new Error('Invalid username or password');
            if (user.status === 'BANNED') throw new Error('Your account has been banned');
            if (user.status !== 'ACTIVE') throw new Error('Your account is not activated');

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) throw new Error('Invalid username or password');

            const accessToken = generateAccessToken(user);
            const refreshToken = await this._createRefreshToken(user.id, getDeviceInfo(req));

            return {
                message: 'Login successful',
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    avatar: user.avatar
                }
            };
        } catch (error) {
            throw new Error(error.message);
        }
    },

    async logout(refreshToken) {
        await this._revokeRefreshToken(refreshToken);
        return { message: 'Logout successful' };
    },

    async refresh(refreshToken, req) {
        if (!refreshToken) throw new Error('Refresh Token not found');

        const hashed = hashRefreshToken(refreshToken);
        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                hashed_token: hashed,
                revoked: false,
                expires_at: { gt: new Date() },
            },
            include: { User: true },
        });

        if (!storedToken || !storedToken.User) {
            throw new Error('Invalid or expired Refresh Token');
        }

        await this._revokeRefreshToken(refreshToken);

        const newAccessToken = generateAccessToken(storedToken.User);
        const newRefreshToken = await this._createRefreshToken(
            storedToken.user_id,
            getDeviceInfo(req)
        );

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    },
};

module.exports = { AuthService };