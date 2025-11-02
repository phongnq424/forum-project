const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const TopicService = {
    createMany: async (topics) => {
        return await prisma.topic.createMany({
            data: topics,
            skipDuplicates: true
        })
    },

    list: async (query) => {
        const page = parseInt(query.page) || 1
        const limit = parseInt(query.limit) || 10
        const skip = (page - 1) * limit
        const where = {}

        if (query.category_id) where.category_id = query.category_id

        const [topics, total] = await Promise.all([
            prisma.topic.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    Category: { select: { id: true, name: true } }
                }
            }),
            prisma.topic.count({ where })
        ])

        return {
            data: topics,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }
    },

    getById: async (id) => {
        return await prisma.topic.findUnique({
            where: { id },
            include: {
                Category: { select: { id: true, name: true } }
            }
        })
    },

    update: async (id, data) => {
        return await prisma.topic.update({ where: { id }, data })
    },

    delete: async (ids) => {
        return await prisma.topic.deleteMany({
            where: { id: { in: ids } }
        })
    }
}

module.exports = { TopicService }
