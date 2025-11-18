const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LeaderboardService = {
    getByChallenge: async (challenge_id) => {
        const boards = await prisma.leaderboard.findMany({
            where: { challenge_id },
            orderBy: { score: 'desc' },
            include: { User: true }
        });

        // Tính rank
        let rank = 1;
        let lastScore = null;
        for (const b of boards) {
            if (lastScore !== null && b.score < lastScore) rank++;
            b.rank = rank;
            lastScore = b.score;
        }

        return boards;
    }
};

module.exports = { LeaderboardService };
