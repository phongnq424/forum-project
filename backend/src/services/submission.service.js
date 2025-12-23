const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redisQueue = require('../config/redisQueue');

const SubmissionService = {
    submit: async ({ challenge_id, user_id, code, language_id }) => {
        const submission = await prisma.submission.create({
            data: { challenge_id, user_id, code, language_id, status: 'PENDING' }
        });

        const testcases = await prisma.testcase.findMany({ where: { challenge_id } });
        const time_limit = (await prisma.challenge.findUnique({ where: { id: challenge_id } })).time_limit;
        const lang = await prisma.language.findUnique({ where: { id: language_id } });
        if (!lang) throw new Error('Invalid language');

        const job = {
            submissionId: submission.id,
            code,
            time_limit: time_limit,
            language: lang.code,
            testcases: testcases.map(t => ({
                testcaseId: t.id
            }))
        };
        console.log('Enqueuing job:', job);
        await redisQueue.lpush('judge_queue', JSON.stringify(job));
        return submission;
    },

    updateResult: async ({ submissionId, score, status }) => {
        const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
        if (!submission) throw new Error('Submission not found');

        await prisma.submission.update({
            where: { id: submissionId },
            data: { score, status }
        });

        const existing = await prisma.leaderboard.findFirst({
            where: { challenge_id: submission.challenge_id, user_id: submission.user_id }
        });

        if (!existing) {
            await prisma.leaderboard.create({
                data: {
                    challenge_id: submission.challenge_id,
                    user_id: submission.user_id,
                    rank: 0,
                    score // dùng score từ worker
                }
            });
        } else if (score > existing.score) {
            await prisma.leaderboard.update({
                where: { id: existing.id },
                data: { score }
            });
        }

        return { submissionId, score, status };
    },

    listByChallenge: async (challenge_id) => {
        return await prisma.submission.findMany({
            where: { challenge_id },
            include: { User: true, Language: true },
            orderBy: { submitted_at: 'desc' }
        });
    },

    getById: async (id) => {
        return await prisma.submission.findUnique({
            where: { id },
            include: { Challenge: true, User: true, Language: true }
        });
    }
};

module.exports = { SubmissionService };
