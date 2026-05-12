const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const LanguageService = {
    list: async () => {
        return await prisma.language.findMany({
            where: {
                is_active: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    },

    getById: async (id) => {
        return await prisma.language.findFirst({
            where: {
                id,
                is_active: true
            }
        });
    },

    createMany: async (data) => {
        return await prisma.language.createMany({
            data,
            skipDuplicates: true
        });
    },

    update: async (id, data) => {
        try {
            const allowed = ["name", "code", "runtime", "is_active"];
            const updateData = {};

            for (const key of allowed) {
                if (data[key] !== undefined) updateData[key] = data[key];
            }

            return await prisma.language.update({
                where: { id },
                data: updateData
            });
        } catch (err) {
            if (err.code === 'P2025') return null;
            throw err;
        }
    },

    removeMany: async (ids) => {
        return await prisma.language.updateMany({
            where: { id: { in: ids } },
            data: { is_active: false }
        });
    }
};

module.exports = { LanguageService };