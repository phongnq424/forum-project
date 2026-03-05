const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

const UserService = {
    list: async function (query, { viewerId = null, blockContext = null } = {}) {
        var take = Number(query.limit) || 50
        var page = Number(query.page) || 1
        var skip = Number(query.offset) || (page - 1) * take

        var where = {
            status: 'ACTIVE'
        }

        if (query.search) {
            where.OR = [
                { username: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ]
        }

        const blockedIds = blockContext?.blockedUserIds
            ? Array.from(blockContext.blockedUserIds)
            : []

        if (blockedIds.length > 0) {
            where.id = { notIn: blockedIds }
        }

        const [total, users] = await prisma.$transaction([
            prisma.user.count({ where }),
            prisma.user.findMany({
                where,
                skip,
                take,
                orderBy: { created_at: 'desc' }, // Nên có sắp xếp để list không bị lộn xộn
                select: { id: true, username: true, email: true, role: true, created_at: true, fullname: true, avatar: true }
            })
        ])

        const totalPages = Math.ceil(total / take)
        const currentPage = Math.floor(skip / take) + 1
        return {
            data: users,
            meta: {
                total,
                page: currentPage,
                limit: take,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            }
        }
    },

    findById: async function (id, { viewerId = null, blockContext = null } = {}) {
        if (viewerId && viewerId !== id && blockContext?.blockedSet?.has(id)) {
            return null
        }
        var user = await prisma.user.findUnique({
            where: {
                id,
                status: 'ACTIVE'
            },
            select: { id: true, username: true, email: true, role: true, created_at: true }
        })
        return user
    },

    // Đổi tên thành updateBasicInfo cho khớp với Controller
    updateBasicInfo: async function (id, data) {
        var allowed = ['username', 'email'] // Ép chặt chỉ cho đổi mấy cái này
        var updateData = {}
        for (var key in data) {
            if (allowed.includes(key)) updateData[key] = data[key]
        }

        const user = await prisma.user.findFirst({
            where: { id, status: 'ACTIVE' }
        })
        if (!user) throw new Error('User not found')

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, username: true, email: true, role: true }
        })
    },

    changePassword: async function (id, oldPassword, newPassword) {
        var user = await prisma.user.findFirst({
            where: { id, status: 'ACTIVE', is_deleted: false }
        })
        if (!user) throw new Error('User not found')

        var valid = await bcrypt.compare(oldPassword, user.password_hash)
        if (!valid) throw new Error('Old password is incorrect')

        var hashed = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id },
            data: { password_hash: hashed }
        })
        return true
    }
}

module.exports = { UserService }