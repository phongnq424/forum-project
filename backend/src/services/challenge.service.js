const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const challengeSelect = {
    id: true,
    title: true,
    difficulty: true,
    type: true,
    point: true,
    created_at: true,
    time_limit: true,
    memory_limit: true
};

function splitChallengePayload(data) {
    const {
        config,
        ...challengeData
    } = data;

    return {
        challengeData,
        configData: config || null
    };
}

const ChallengeService = {
    create: async (data) => {
        const { challengeData, configData } = splitChallengePayload(data);

        return await prisma.challenge.create({
            data: {
                ...challengeData,
                config: configData
                    ? {
                        create: configData
                    }
                    : undefined
            },
            include: {
                config: true
            }
        });
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
            ];
        }

        let orderBy = { created_at: 'desc' };
        if (query.sortBy === "difficulty-asc") orderBy = { difficulty: 'asc' };
        if (query.sortBy === "difficulty-desc") orderBy = { difficulty: 'desc' };

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
                prisma.challenge.findMany({
                    skip,
                    take: limit,
                    where,
                    orderBy,
                    select: {
                        ...challengeSelect,
                        _count: {
                            select: {
                                Submission: true
                            }
                        }
                    }
                }),
                prisma.challenge.count({ where })
            ]);

            challenges = challengeList;
            total = totalCount;
            solvedIds = new Set(solvedData.map(s => s.challenge_id));
        } else {
            const [challengeList, totalCount] = await Promise.all([
                prisma.challenge.findMany({
                    skip,
                    take: limit,
                    where,
                    orderBy,
                    select: challengeSelect
                }),
                prisma.challenge.count({ where })
            ]);

            challenges = challengeList;
            total = totalCount;
        }

        const data = challenges.map(challenge => ({
            ...challenge,
            isSolved: solvedIds.has(challenge.id),
            totalSubmissions: challenge._count?.Submission || 0
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

    getById: async (id, viewerId) => {
        const [challenge, userStats, acceptedSubmission] = await Promise.all([
            prisma.challenge.findUnique({
                where: { id },
                include: {
                    config: true
                }
            }),
            viewerId ? prisma.submission.aggregate({
                where: { challenge_id: id, user_id: viewerId },
                _max: { score: true },
                _count: { _all: true }
            }) : null,
            viewerId ? prisma.submission.findFirst({
                where: {
                    challenge_id: id,
                    user_id: viewerId,
                    status: "ACCEPTED"
                },
                select: { id: true }
            }) : null,
        ]);

        if (!challenge) return null;

        return {
            ...challenge,
            isSolved: !!acceptedSubmission,
            userStats: viewerId ? {
                highestScore: userStats?._max?.score || 0,
                totalSubmissions: userStats?._count?._all || 0
            } : null
        };
    },

    update: async (id, data) => {
        const { challengeData, configData } = splitChallengePayload(data);

        try {
            return await prisma.challenge.update({
                where: { id },
                data: {
                    ...challengeData,
                    config: configData
                        ? {
                            upsert: {
                                create: configData,
                                update: configData
                            }
                        }
                        : undefined
                },
                include: {
                    config: true
                }
            });
        } catch (err) {
            if (err.code === 'P2025') return null;
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