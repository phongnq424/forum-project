const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const UserService = {
    list: async function (query) {
        var take = Number(query.limit) || 50
        var skip = Number(query.offset) || 0
        var where = {}
        if (query.search) {
            where.OR = [
                { username: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ]
        }
        var users = await prisma.user.findMany({
            where,
            skip,
            take,
            select: { id: true, username: true, email: true, role: true, created_at: true }
        })
        return users
    },

    findById: async function (id) {
        var user = await prisma.user.findUnique({
            where: { id },
            select: { id: true, username: true, email: true, role: true, created_at: true }
        })
        return user
    },

    update: async function (id, data) {
        var allowed = ['username', 'email']
        var updateData = {}
        for (var key in data) {
            if (allowed.includes(key)) updateData[key] = data[key]
        }
        var user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, username: true, email: true, role: true }
        })
        return user
    },

    changePassword: async function (id, oldPassword, newPassword) {
        var user = await prisma.user.findUnique({ where: { id } })
        if (!user) throw new Error('User not found')
        var valid = await bcrypt.compare(oldPassword, user.password_hash)
        if (!valid) throw new Error('Old password is incorrect')
        var hashed = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id },
            data: { password_hash: hashed }
        })
        return true
    },

    remove: async function (id) {
        var user = await prisma.user.findUnique({ where: { id } })
        if (!user) throw new Error('User not found')
        await prisma.user.delete({ where: { id } })
        return true
    }
}

module.exports = { UserService }
