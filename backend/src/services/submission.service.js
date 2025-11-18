const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const redisQueue = require('../config/redisQueue');

const SubmissionService = {
    submit: async ({ challenge_id, user_id, code, language_id }) => {
        const submission = await prisma.submission.create({
            data: { challenge_id, user_id, code, language_id, status: 'pending' }
        });

        const testcases = await prisma.testcase.findMany({ where: { challenge_id } });

        for (const t of testcases) {
            const job = {
                submissionId: submission.id,
                testcaseId: t.id,
                code,
                language: language_id,
                input: t.input,
                expectedOutput: t.expected_output
            };
            await redisQueue.lpush('judge_queue', JSON.stringify(job));
        }

        return submission;
    },

    updateResult: async ({ submissionId, testcaseId, result, output, stderr }) => {
        const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
        if (!submission) throw new Error('Submission not found');

        // Tạo hoặc update chi tiết điểm của testcase
        await prisma.submissionTestcase.upsert({
            where: { submission_id_testcase_id: { submission_id: submissionId, testcase_id: testcaseId } },
            update: { result, output, stderr },
            create: { submission_id: submissionId, testcase_id: testcaseId, result, output, stderr }
        });

        // Tính tổng điểm mới
        const allResults = await prisma.submissionTestcase.findMany({ where: { submission_id: submissionId } });
        const totalScore = allResults.reduce((sum, r) => sum + ((r.result === 'AC') ? 1 : 0), 0); // hoặc theo score testcase

        // Update submission
        await prisma.submission.update({
            where: { id: submissionId },
            data: { status: 'finished', score: totalScore }
        });

        // Update leaderboard
        const existing = await prisma.leaderboard.findFirst({ where: { challenge_id: submission.challenge_id, user_id: submission.user_id } });
        if (!existing) {
            await prisma.leaderboard.create({
                data: { challenge_id: submission.challenge_id, user_id: submission.user_id, score: totalScore, rank: 0 }
            });
        } else if (totalScore > existing.score) {
            await prisma.leaderboard.update({
                where: { id: existing.id },
                data: { score: totalScore }
            });
        }
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
