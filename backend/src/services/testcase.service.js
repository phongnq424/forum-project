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
            input_path: tc.input_path,
            expected_output_path: tc.expected_output_path,
            schema_path: tc.schema_path || null,
            score: index === n - 1 ? (baseScore + extraScore) : baseScore
        }));

        await prisma.testcase.createMany({
            data: dataToInsert
        });

        return await prisma.testcase.findMany({ where: { challenge_id } });
    },

    listByChallenge: async (challenge_id) => {
        return prisma.testcase.findMany({ where: { challenge_id } });
    },

    listByIds: async (ids) => {
        return prisma.testcase.findMany({ where: { id: { in: ids } } });
    },

    update: async (id, data) => {
        return prisma.testcase.update({ where: { id }, data });
    },

    delete: async (id) => {
        return prisma.testcase.delete({ where: { id } });
    }
};

module.exports = { TestcaseService };
