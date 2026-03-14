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

        await fsp.mkdir(challengeDir, { recursive: true });

        await new Promise((resolve, reject) => {
            fs.createReadStream(zipPath)
                .pipe(unzipper.Extract({ path: challengeDir }))
                .on('close', resolve)
                .on('error', reject);
        });

        await fsp.unlink(zipPath).catch(() => { });

        const files = await walkFiles(challengeDir);

        if (!files.length)
            throw new Error('Zip extracted but no files found');

        const testcases = parseTestcases(files);

        if (!testcases.length)
            throw new Error('No input/output pairs found');

        const n = testcases.length;
        const baseScore = Math.floor(100 / n);

        const created = [];

        for (const tc of testcases) {

            const c = await prisma.testcase.create({
                data: {
                    challenge_id,
                    input_path: tc.input_path,
                    expected_output_path: tc.expected_output_path,
                    score: baseScore
                }
            });

            created.push(c);
        }

        return created;
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
