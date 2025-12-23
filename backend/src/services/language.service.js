const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LanguageService = {
    list: async () => {
        return await prisma.language.findMany();
    },

    getById: async (id) => {
        return await prisma.language.findUnique({ where: { id } });
    },

    createMany: async (data) => {
        return await prisma.language.createMany({ data, skipDuplicates: true });
    },

    update: async (id, data) => {
        try {
            return await prisma.language.update({ where: { id }, data });
        } catch (err) {
            if (err.code === 'P2025') return null;
            throw err;
        }
    },

    removeMany: async (ids) => {
        return await prisma.language.deleteMany({ where: { id: { in: ids } } });
    }
};

module.exports = { LanguageService };
