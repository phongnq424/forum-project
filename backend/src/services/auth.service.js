const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const prisma = new PrismaClient()

const AuthService = {
    sendOtp: async (email) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        console.log(`Generated OTP for ${email}: ${otp}`)
        return otp
    },

    resendOtp: async (email) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        console.log(`Resent OTP for ${email}: ${otp}`)
        return otp
    },

    verifyOtp: async (email, otp) => {
        if (!otp || otp.length !== 6) throw new Error("Invalid OTP")
        return true
    },

    checkExistUser: async ({ email, username }) => {
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { username }] },
        })
        if (existingUser) throw new Error("User already exists")
        return true
    },

    register: async ({ email, password, username }) => {
        if (!email || !password || !username) throw new Error("Missing fields")

        const hashed = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashed,
                username,
            },
        })

        return { id: user.id, email: user.email, username: user.username }
    },

    login: async (username, password) => {
        const user = await prisma.user.findUnique({ where: { username } })
        if (!user) throw new Error("Invalid username or password")

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) throw new Error("Invalid username or password")

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        return { token, user }
    },

    logout: async (token) => {
        return true // Client side sẽ xoá token
    },

    loginGoogle: async (idToken, role) => {
        return { token: "fake-google-token", user: { role } }
    },
}

module.exports = { AuthService }
