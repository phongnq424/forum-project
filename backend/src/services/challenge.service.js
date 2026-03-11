const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ChallengeService = {
    create: async (data) => {
        return await prisma.challenge.create({ data });
    },

    list: async (query, viewerId) => {

        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;

        let where = {};
        if (query.type) where.type = query.type;
        if (query.q) {
            where.AND = [
                {
                    OR: [
                        { title: { contains: query.q, mode: 'insensitive' } },
                        { description: { contains: query.q, mode: 'insensitive' } }
                    ]
                }
            ]
        }
        let orderBy = { created_at: 'desc' };
        if (query.sortBy === "difficulty-asc") {
            orderBy = { difficulty: 'asc' }
        }

        if (query.sortBy === "difficulty-desc") {
            orderBy = { difficulty: 'desc' }
        }
        let challenges = [];
        let total = 0;
        let solvedIds = new Set();

        if (viewerId) {
            const [solvedData, challengeList, totalCount] = await Promise.all([
                prisma.submission.findMany({
                    where: { user_id: viewerId, status: "ACCEPTED" },
                    distinct: ["challenge_id"],
                    select: { challenge_id: true }
                }),
                prisma.challenge.findMany({ skip, take: limit, where, orderBy }),
                prisma.challenge.count({ where })
            ]);

            challenges = challengeList;
            total = totalCount;
            solvedIds = new Set(solvedData.map(s => s.challenge_id));
        } else {
            const [challengeList, totalCount] = await Promise.all([
                prisma.challenge.findMany({ skip, take: limit, where, orderBy }),
                prisma.challenge.count({ where })
            ]);
            challenges = challengeList;
            total = totalCount;
        }
        const data = challenges.map(challenge => ({
            ...challenge,
            isSolved: solvedIds.has(challenge.id)
        }));

        return {
            data,
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
