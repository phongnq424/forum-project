const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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
                }
            }
        })


        for (let i = 0; i < boards.length; i++) {
            boards[i].rank = i + 1
        }

        return boards
    }
}

module.exports = { LeaderboardService }
