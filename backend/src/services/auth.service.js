const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../config/mailer');
const redisClient = require('../config/redis');
//const googleClient = require('../config/googleClient');

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET;

const AuthService = {
    sendOtp: async (email) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await redisClient.set(`otp:${email}`, otp, 'EX', 300);
            await sendMail(email, "Mã OTP xác thực", `Mã OTP của bạn là: ${otp}`);
            return otp;
        } catch (error) {
            throw new Error('Error sending OTP: ' + error.message);
        }
    },

    resendOtp: async (email) => {
        try {
            await redisClient.del(`otp:${email}`);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await redisClient.set(`otp:${email}`, otp, 'EX', 300);
            await sendMail(email, "Mã OTP xác thực", `Mã OTP mới của bạn là: ${otp}`);
            return otp;
        } catch (error) {
            throw new Error('Error resending OTP: ' + error.message);
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            const savedOtp = await redisClient.get(`otp:${email}`);
            if (!savedOtp) throw new Error('OTP expired or not found');
            if (savedOtp !== otp) throw new Error('Invalid OTP');

            await redisClient.del(`otp:${email}`);
            await redisClient.set(`verified:${email}`, 'true', 'EX', 600);
            return { message: 'Email verified successfully' };
        } catch (error) {
            throw new Error('Error verifying OTP: ' + error.message);
        }
    },

    checkExistUser: async ({ email, username }) => {
        try {
            const existingUser = await prisma.user.findFirst({
                where: {
                    is_deleted: false,
                    OR: [{ email }, { username }]
                },
            });
            if (existingUser) throw new Error('User already exists');
        } catch (error) {
            throw new Error('Error checking existing user: ' + error.message);
        }
    },
    cacheTempUser: async ({ email, username, password, role }) => {
        await redisClient.set(`tempUser:${email}`, JSON.stringify({ email, username, password, role }), 'EX', 600);
    },

    createUserFromCache: async (email) => {
        const data = await redisClient.get(`tempUser:${email}`)
        if (!data) throw new Error("User data expired or not found")

        const { username, password, role } = JSON.parse(data)

        const user = await prisma.user.create({
            data: {
                email,
                username,
                password_hash: await bcrypt.hash(password, 10),
                role: role || 'USER'
            }
        })


        await redisClient.del(`tempUser:${email}`)
        return user
    },

    register: async ({ email, password, username }) => {
        try {
            const verified = await redisClient.get(`verified:${email}`);
            if (!verified) throw new Error('Please verify your email before registering');

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await prisma.user.create({
                data: { email, username, password_hash: hashedPassword },
            });
            await redisClient.del(`verified:${email}`);
            return { message: 'Register successful', user: newUser };
        } catch (error) {
            throw new Error('Error registering user: ' + error.message);
        }
    },

    login: async (username, password) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [{ username }, { email: username }],
                    is_deleted: false
                }
            })

            if (user.status === 'BANNED')
                throw new Error('Your account has been banned')
            if (user.status !== 'ACTIVE')
                throw new Error('Your account is not active')

            if (!user) throw new Error('Invalid username or password');
            const valid = await bcrypt.compare(password, user.password_hash);
            if (!valid) throw new Error('Invalid username or password');

            const token = jwt.sign(
                { id: user.id, role: user.role },
                SECRET_KEY,
                { expiresIn: '7d' }
            );

            return { message: 'Login successful', token };
        } catch (error) {
            throw new Error('Error logging in: ' + error.message);
        }
    },

    logout: async (token) => {
        if (!token) throw new Error('Missing token');
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            const ttl = decoded.exp - Math.floor(Date.now() / 1000);
            if (ttl > 0) await redisClient.set(`blacklist:${token}`, 'true', 'EX', ttl);

            return { message: 'Logout successful' };
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    },

    loginGoogle: async (idToken) => {
        try {
            //   const ticket = await googleClient.verifyIdToken({
            //     idToken,
            //     audience: process.env.GOOGLE_CLIENT_ID,
            //   });
            //   const payload = ticket.getPayload();
            //   const { sub: googleId, email, name, picture: avatar } = payload;

            //   let user = await prisma.user.findUnique({ where: { email } });
            //   if (!user) {
            //     const hashedPassword = bcrypt.hashSync(googleId, 10);
            //     user = await prisma.user.create({
            //       data: { email, username: email, password: hashedPassword, avatar },
            //     });
            //   }

            //   const token = jwt.sign(
            //     { userId: user.id, username: user.username },
            //     SECRET_KEY,
            //     { expiresIn: '7d' }
            //   );

            //   return { message: 'Google login successful', token, user };
        } catch (error) {
            throw new Error('Error logging in with Google: ' + error.message);
        }
    },
};

module.exports = { AuthService };
