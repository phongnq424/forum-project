const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TestcaseService = {
    create: async (challenge_id, input_path, expected_output_path, score) => {
        const data = { challenge_id, input_path, expected_output_path };
        if (typeof score !== 'undefined') data.score = score;
        return prisma.testcase.create({ data });
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
