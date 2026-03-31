const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Queue } = require('bullmq');
const connection = require('../config/redisQueue');

const judgeQueue = new Queue('judge_queue', { connection });

const SubmissionService = {
    submit: async ({ challenge_id, user_id, code, language_id }) => {
        const submission = await prisma.submission.create({
            data: { challenge_id, user_id, code, language_id, status: 'PENDING' }
        });

        const testcases = await prisma.testcase.findMany({ where: { challenge_id } });
        const challenge = await prisma.challenge.findUnique({
            where: { id: challenge_id },
            select: {
                time_limit: true,
                type: true
            }
        });
        const { time_limit, type } = challenge;
        const lang = await prisma.language.findUnique({ where: { id: language_id } });
        if (!lang) throw new Error('Invalid language');

        const job = {
            submissionId: submission.id,
            code,
            type,
            time_limit: time_limit,
            language: lang.code,
            testcases: testcases.map(t => ({
                testcaseId: t.id
            }))
        };
        await judgeQueue.add('judge_task', job, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: true,
            removeOnFail: false
        });
        return submission;
    },

    updateResult: async ({ submissionId, score, status }) => {
        const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { Language: true } });
        if (!submission) throw new Error('Submission not found');

        await prisma.submission.update({
            where: { id: submissionId },
            data: { score, status }
        });

        const existing = await prisma.leaderboard.findFirst({
            where: { challenge_id: submission.challenge_id, user_id: submission.user_id }
        });

        const submissionTime = submission.created_at;

        if (!existing) {
            await prisma.leaderboard.create({
                data: {
                    challenge_id: submission.challenge_id,
                    user_id: submission.user_id,
                    rank: 0,
                    score,
                    submitted_at: submissionTime,
                    language: submission.Language?.code || 'unknown',
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
            orderBy: { submitted_at: 'desc' },
            include: {
                User: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        fullname: true,
                        avatar: true
                    }
                },
                Language: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        }
        )
    },
    listByUser: async (user_id) => {
        return await prisma.submission.findMany({
            where: { user_id },
            orderBy: { submitted_at: 'desc' },
            include: {
                Challenge: {
                    select: {
                        id: true,
                        title: true,
                        time_limit: true
                    }
                },
                Language: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        })
    },

    listByUserAndChallenge: async (user_id, challenge_id) => {
        return await prisma.submission.findMany({
            where: { user_id, challenge_id },
            orderBy: { submitted_at: 'desc' },
            select: {
                id: true,
                status: true,
                score: true,
                submitted_at: true,
                language_id: true,

                Language: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        })
    },

    getById: async (id) => {
        return await prisma.submission.findUnique({
            where: { id },
            include: {
                Challenge: {
                    select: {
                        id: true,
                        title: true,
                        time_limit: true
                    }
                },
                User: {
                    select: {
                        id: true,
                        email: true,
                        username: true,

                        fullname: true,
                        avatar: true
                    }
                },
                Language: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            }
        }
        )
    }

};

module.exports = { SubmissionService };
