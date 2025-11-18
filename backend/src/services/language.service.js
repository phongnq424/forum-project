const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LanguageService = {
    list: async () => {
        return await prisma.language.findMany();
    },

    getById: async (id) => {
        return await prisma.language.findUnique({ where: { id } });
    }
};

module.exports = { LanguageService };
