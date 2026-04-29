const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const AdminUserService = {
    listAll: async function (query) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit

        const where = {}

        if (query.search) {
            where.OR = [
                { username: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ]
        }

        if (query.status) {
            where.status = query.status
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    status: true,
                    is_deleted: true,
                    created_at: true
                },
                orderBy: { created_at: 'desc' }
            }),
            prisma.user.count({ where })
        ])

        return {
            data: users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    // Admin update có thể đổi cả role và status
    updateAnyUser: async function (id, data) {
        // Mở rộng các trường Admin được phép sửa
        var allowed = ['username', 'email', 'role', 'status']
        var updateData = {}
        for (var key in data) {
            if (allowed.includes(key)) updateData[key] = data[key]
        }

        const user = await prisma.user.findUnique({
            where: { id }
        })
        if (!user) throw new Error('User not found')

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, username: true, email: true, role: true, status: true }
        })
    },

    // Hàm remove cũ của ông mang sang đây đổi tên cho rõ nghĩa
    softDelete: async function (id) {
        const user = await prisma.user.findUnique({
            where: { id }
        })
        if (!user) throw new Error('User not found')

        // Tránh Admin xóa nhầm người đã xóa rồi
        if (user.is_deleted) throw new Error('User is already deleted')

        await prisma.user.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
                status: 'INACTIVE'
            }
        })
        return true
    }
}

module.exports = { AdminUserService }