const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { Queue } = require('bullmq');
const connection = require('../config/redisQueue');

const judgeQueue = new Queue('judge_queue', { connection });

function getFinalSubmissionStatus(score, maxScore, incomingStatus) {
    if (incomingStatus === "ACCEPTED") return "ACCEPTED";
    if (["CE", "RE", "TLE", "MLE", "IE"].includes(incomingStatus)) return incomingStatus;

    if (score > 0 && score < maxScore) return "PARTIAL";
    if (score >= maxScore) return "ACCEPTED";
    return "WA";
}

const SubmissionService = {
    submit: async ({ challenge_id, user_id, code, file_path, kind = "CODE", language_id }) => {
        const [challenge, lang] = await Promise.all([
            prisma.challenge.findUnique({
                where: { id: challenge_id },
                include: {
                    config: true,
                    Testcase: {
                        orderBy: { order_index: 'asc' },
                        select: {
                            id: true,
                            score: true
                        }
                    }
                }
            }),
            prisma.language.findUnique({
                where: { id: language_id }
            })
        ]);

        if (!challenge) throw new Error('Challenge not found');
        if (!lang) throw new Error('Invalid language');

        if (kind === "CODE" && !code) {
            throw new Error("Code is required for CODE submission");
        }

        if (kind === "ZIP" && !file_path) {
            throw new Error("file_path is required for ZIP submission");
        }

        const submission = await prisma.submission.create({
            data: {
                challenge_id,
                user_id,
                code: kind === "CODE" ? code : null,
                file_path: kind === "ZIP" ? file_path : null,
                kind,
                language_id,
                status: 'PENDING',
                score: 0
            }
        });

        const job = {
            submissionId: submission.id,
            challengeId: challenge.id,

            type: challenge.type,
            language: lang.code,

            kind,
            code: kind === "CODE" ? code : null,
            file_path: kind === "ZIP" ? file_path : null,

            time_limit: challenge.time_limit,
            memory_limit: challenge.memory_limit,

            config: challenge.config || null,

            testcases: challenge.Testcase.map(t => ({
                testcaseId: t.id,
                score: t.score
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

    updateResult: async ({
        submissionId,
        score,
        status,
        testcases = [],
        runtime_ms,
        memory_kb,
        error_message
    }) => {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                Language: true,
                Challenge: {
                    include: {
                        Testcase: {
                            select: {
                                id: true,
                                score: true
                            }
                        }
                    }
                }
            }
        });

        if (!submission) throw new Error('Submission not found');

        const maxScore = submission.Challenge.Testcase.reduce(
            (sum, t) => sum + (t.score || 0),
            0
        );

        const finalStatus = getFinalSubmissionStatus(score, maxScore, status);

        await prisma.$transaction(async (tx) => {
            await tx.submission.update({
                where: { id: submissionId },
                data: {
                    score,
                    status: finalStatus,
                    runtime_ms: runtime_ms || null,
                    memory_kb: memory_kb || null,
                    error_message: error_message || null,
                    finished_at: new Date()
                }
            });

            if (Array.isArray(testcases) && testcases.length > 0) {
                await tx.submissionTestcaseResult.deleteMany({
                    where: { submission_id: submissionId }
                });

                await tx.submissionTestcaseResult.createMany({
                    data: testcases.map(t => ({
                        submission_id: submissionId,
                        testcase_id: t.testcaseId,
                        status: normalizeTestcaseStatus(t.result || t.status),
                        score: t.score || 0,
                        max_score: t.maxScore || 0,
                        runtime_ms: t.runtime_ms || null,
                        memory_kb: t.memory_kb || null,
                        message: t.message || null,
                        stdout: t.stdout || null,
                        stderr: t.stderr || null
                    }))
                });
            }

            const existing = await tx.leaderboard.findFirst({
                where: {
                    challenge_id: submission.challenge_id,
                    user_id: submission.user_id
                }
            });

            const shouldUpdateLeaderboard =
                !existing ||
                score > existing.score ||
                (
                    score === existing.score &&
                    submission.submitted_at < existing.submitted_at
                );

            if (!existing) {
                await tx.leaderboard.create({
                    data: {
                        challenge_id: submission.challenge_id,
                        user_id: submission.user_id,
                        best_submission_id: submission.id,
                        score,
                        submitted_at: submission.submitted_at
                    }
                });
            } else if (shouldUpdateLeaderboard) {
                await tx.leaderboard.update({
                    where: { id: existing.id },
                    data: {
                        best_submission_id: submission.id,
                        score,
                        submitted_at: submission.submitted_at
                    }
                });
            }
        });

        return {
            submissionId,
            score,
            status: finalStatus
        };
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
        });
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
                        time_limit: true,
                        type: true,
                        point: true
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
        });
    },

    listByUserAndChallenge: async (user_id, challenge_id) => {
        return await prisma.submission.findMany({
            where: { user_id, challenge_id },
            orderBy: { submitted_at: 'desc' },
            select: {
                id: true,
                status: true,
                score: true,
                kind: true,
                submitted_at: true,
                language_id: true,
                Language: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });
    },

    getById: async (id) => {
        return await prisma.submission.findUnique({
            where: { id },
            include: {
                Challenge: {
                    select: {
                        id: true,
                        title: true,
                        time_limit: true,
                        type: true,
                        point: true
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
                },
                testcase_results: {
                    orderBy: {
                        created_at: 'asc'
                    },
                    include: {
                        Testcase: {
                            select: {
                                id: true,
                                name: true,
                                score: true,
                                visibility: true,
                                order_index: true
                            }
                        }
                    }
                }
            }
        });
    }
};

function normalizeTestcaseStatus(status) {
    if (status === "ACCEPTED") return "AC";
    if (status === "AC") return "AC";
    if (["WA", "CE", "RE", "TLE", "MLE", "IE", "SKIPPED"].includes(status)) return status;
    return "IE";
}

module.exports = { SubmissionService };