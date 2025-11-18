const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TestcaseService = {
    createMany: async (challenge_id, testcases) => {
        const data = testcases.map(t => ({ ...t, challenge_id }));
        return await prisma.testcase.createMany({ data });
    },

    listByChallenge: async (challenge_id) => {
        return await prisma.testcase.findMany({ where: { challenge_id } });
    },

    update: async (id, data) => {
        return await prisma.testcase.update({ where: { id }, data });
    },

    delete: async (id) => {
        return await prisma.testcase.delete({ where: { id } });
    }
};

module.exports = { TestcaseService };
