const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LeaderboardService = {
    getByChallenge: async (challenge_id) => {
        const boards = await prisma.leaderboard.findMany({
            where: { challenge_id },
            orderBy: [
                { score: 'desc' },
                { submitted_at: 'asc' }
            ],
            include: {
                User: {
                    select: {
                        email: true,
                        username: true,
                        avatar: true,
                        fullname: true
                    }
                },
                Submission: {
                    select: {
                        id: true,
                        status: true,
                        submitted_at: true,
                        Language: {
                            select: {
                                name: true,
                                code: true
                            }
                        }
                    }
                }
            }
        });

        return boards.map((b, index) => ({
            id: b.id,
            challenge_id: b.challenge_id,
            user_id: b.user_id,
            score: b.score,
            rank: index + 1,
            submitted_at: b.submitted_at,
            user: b.User,
            submission: b.Submission,
            language: b.Submission?.Language?.code || "unknown"
        }));
    }
};

module.exports = { LeaderboardService };