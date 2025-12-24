const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ChallengeService = {
    create: async (data) => {
        return await prisma.challenge.create({ data });
    },

    list: async (query) => {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [challenges, total] = await Promise.all([
            prisma.challenge.findMany({
                skip,
                take: limit,
                orderBy: { created_at: 'desc' }
            }),
            prisma.challenge.count()
        ]);

        return {
            data: challenges,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    },

    getById: async (id) => {
        return await prisma.challenge.findUnique({
            where: { id },
            include: { Testcase: true, Submission: true, Leaderboard: true }
        });
    },

    update: async (id, data) => {
        try {
            return await prisma.challenge.update({ where: { id }, data });
        } catch (err) {
            if (err.code === 'P2025') return null; // record not found
            throw err;
        }
    },

    delete: async (id) => {
        try {
            return await prisma.challenge.delete({ where: { id } });
        } catch (err) {
            if (err.code === 'P2025') return null;
            throw err;
        }
    }

};

module.exports = { ChallengeService };
