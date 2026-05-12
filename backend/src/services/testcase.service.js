const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const unzipper = require('unzipper');
const { walkFiles } = require('../utils/file.utils');
const { parseTestcases } = require('../utils/testcase-parser.util');

const TestcaseService = {
    createFromZip: async (challenge_id, zipPath) => {
        const challengeDir = path.dirname(zipPath);

        const challenge = await prisma.challenge.findUnique({
            where: { id: challenge_id }
        });

        if (!challenge) throw new Error('Challenge not found');

        const totalPoint = challenge.point;

        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: challengeDir }))
                .on('close', resolve)
                .on('error', reject);
        });

        await fsp.unlink(zipPath).catch(() => { });

        const files = await walkFiles(challengeDir);
        const testcases = parseTestcases(files);

        if (!testcases.length) throw new Error('No input/output pairs found');

        const n = testcases.length;
        const baseScore = Math.floor(totalPoint / n);
        const extraScore = totalPoint % n;

        const dataToInsert = testcases.map((tc, index) => ({
            challenge_id,
            name: `Testcase ${index + 1}`,
            input_path: tc.input_path,
            expected_output_path: tc.expected_output_path,
            schema_path: tc.schema_path || null,
            input_json: null,
            expected_json: null,
            visibility: "HIDDEN",
            order_index: index,
            score: index === n - 1 ? (baseScore + extraScore) : baseScore
        }));

        await prisma.testcase.createMany({
            data: dataToInsert
        });

        return await prisma.testcase.findMany({
            where: { challenge_id },
            orderBy: { order_index: 'asc' }
        });
    },

    createApiTestcase: async (challenge_id, data) => {
        const challenge = await prisma.challenge.findUnique({
            where: { id: challenge_id }
        });

        if (!challenge) throw new Error("Challenge not found");
        if (challenge.type !== "BACKEND") {
            throw new Error("createApiTestcase only supports NODE_API challenge");
        }

        const {
            name,
            score = 1,
            visibility = "HIDDEN",
            order_index = 0,
            input_json = null,
            expected_json = null,
            steps = []
        } = data;

        return await prisma.testcase.create({
            data: {
                challenge_id,
                name,
                score,
                visibility,
                order_index,
                input_json,
                expected_json,
                steps: steps.length
                    ? {
                        create: steps.map((step, index) => ({
                            name: step.name || `Step ${index + 1}`,
                            order_index: step.order_index ?? index,
                            method: step.method,
                            path: step.path,
                            headers_json: step.headers_json || null,
                            body_json: step.body_json || null,
                            expected_status: step.expected_status,
                            expected_json: step.expected_json || null,
                            expected_headers_json: step.expected_headers_json || null,
                            assert_json: step.assert_json || null,
                            save_variables: step.save_variables || null,
                            score: step.score ?? 1
                        }))
                    }
                    : undefined
            },
            include: {
                steps: {
                    orderBy: {
                        order_index: 'asc'
                    }
                }
            }
        });
    },

    listByChallenge: async (challenge_id) => {
        return prisma.testcase.findMany({
            where: { challenge_id },
            orderBy: { order_index: 'asc' },
            include: {
                steps: {
                    orderBy: {
                        order_index: 'asc'
                    }
                }
            }
        });
    },

    listByIds: async (ids) => {
        return prisma.testcase.findMany({
            where: { id: { in: ids } },
            include: {
                steps: {
                    orderBy: {
                        order_index: 'asc'
                    }
                }
            }
        });
    },

    update: async (id, data) => {
        const { steps, ...testcaseData } = data;

        return await prisma.$transaction(async (tx) => {
            const updated = await tx.testcase.update({
                where: { id },
                data: testcaseData
            });

            if (Array.isArray(steps)) {
                await tx.testcaseStep.deleteMany({
                    where: { testcase_id: id }
                });

                if (steps.length > 0) {
                    await tx.testcaseStep.createMany({
                        data: steps.map((step, index) => ({
                            testcase_id: id,
                            name: step.name || `Step ${index + 1}`,
                            order_index: step.order_index ?? index,
                            method: step.method,
                            path: step.path,
                            headers_json: step.headers_json || null,
                            body_json: step.body_json || null,
                            expected_status: step.expected_status,
                            expected_json: step.expected_json || null,
                            expected_headers_json: step.expected_headers_json || null,
                            assert_json: step.assert_json || null,
                            save_variables: step.save_variables || null,
                            score: step.score ?? 1
                        }))
                    });
                }
            }

            return tx.testcase.findUnique({
                where: { id },
                include: {
                    steps: {
                        orderBy: {
                            order_index: 'asc'
                        }
                    }
                }
            });
        });
    },

    delete: async (id) => {
        return prisma.testcase.delete({ where: { id } });
    }
};

module.exports = { TestcaseService };