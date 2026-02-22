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
            // Sử dụng crypto.randomInt để OTP bảo mật hơn Math.random
            const otp = crypto.randomInt(100000, 1000000).toString();
            await redisClient.set(`otp:${email}`, otp, 'EX', 300); // 5 phút
            await sendMail(email, "Mã OTP xác thực", `Mã OTP của bạn là: ${otp}`);
            return otp;
        } catch (error) {
            throw new Error('Lỗi gửi OTP: ' + error.message);
        }
    },

    async resendOtp(email) {
        try {
            await redisClient.del(`otp:${email}`);
            return await this.sendOtp(email);
        } catch (error) {
            throw new Error('Lỗi gửi lại OTP: ' + error.message);
        }
    },

    async verifyOtp(email, otp) {
        try {
            const savedOtp = await redisClient.get(`otp:${email}`);
            if (!savedOtp) throw new Error('OTP đã hết hạn hoặc không tồn tại');
            if (savedOtp !== otp) throw new Error('Mã OTP không chính xác');

            await redisClient.del(`otp:${email}`);
            // Đánh dấu email này đã verify để cho phép đăng ký trong 10 phút tiếp theo
            await redisClient.set(`verified:${email}`, 'true', 'EX', 600);
            return { message: 'Xác thực email thành công' };
        } catch (error) {
            throw new Error('Lỗi xác thực OTP: ' + error.message);
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
        if (existingUser) throw new Error('Người dùng hoặc email đã tồn tại');
    },

    async register({ email, password, username }, req) {
        try {
            // 1. Kiểm tra xem email đã qua bước verify OTP chưa
            const isVerified = await redisClient.get(`verified:${email}`);
            if (!isVerified) throw new Error('Vui lòng xác thực email trước khi đăng ký');

            // 2. Kiểm tra trùng lặp lần cuối
            await this.checkExistUser({ email, username });

            // 3. Hash mật khẩu và tạo user
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: {
                    email,
                    username,
                    password_hash: hashedPassword,
                    role: 'USER',
                    status: 'ACTIVE' // Hoặc PENDING tùy logic của bạn
                },
            });

            // 4. Dọn dẹp cache xác thực
            await redisClient.del(`verified:${email}`);

            // 5. Tự động tạo token (Auto-login sau khi đăng ký)
            const deviceInfo = req ? getDeviceInfo(req) : null;
            const refreshToken = await this._createRefreshToken(newUser.id, deviceInfo);
            const accessToken = generateAccessToken(newUser);

            return {
                message: 'Đăng ký tài khoản thành công',
                user: newUser,
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw new Error('Lỗi đăng ký: ' + error.message);
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

            if (!user) throw new Error('Tài khoản hoặc mật khẩu không chính xác');
            if (user.status === 'BANNED') throw new Error('Tài khoản của bạn đã bị khóa');
            if (user.status !== 'ACTIVE') throw new Error('Tài khoản chưa được kích hoạt');

            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) throw new Error('Tài khoản hoặc mật khẩu không chính xác');

            const accessToken = generateAccessToken(user);
            const refreshToken = await this._createRefreshToken(user.id, getDeviceInfo(req));

            return {
                message: 'Đăng nhập thành công',
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
        } catch (error) {
            throw new Error('Lỗi đăng nhập: ' + error.message);
        }
    },

    async logout(refreshToken) {
        await this._revokeRefreshToken(refreshToken);
        return { message: 'Đăng xuất thành công' };
    },

    async refresh(refreshToken, req) {
        if (!refreshToken) throw new Error('Không tìm thấy Refresh Token');

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
            throw new Error('Refresh Token không hợp lệ hoặc đã hết hạn');
        }

        await this._revokeRefreshToken(refreshToken);

        const newAccessToken = generateAccessToken(storedToken.User);
        const newRefreshToken = await this._createRefreshToken(storedToken.user_id, getDeviceInfo(req));

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    },
};

module.exports = { AuthService };