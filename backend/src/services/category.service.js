const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CategoryService = {
  createMany: async (categories) => {
    return await prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });
  },

  list: async (query) => {
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          Topic: { select: { id: true, name: true } },
        },
      }),
      prisma.category.count(),
    ]);

    return {
      data: categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (id) => {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        Topic: { select: { id: true, name: true } },
      },
    });
  },

  update: async (id, data) => {
    return await prisma.category.update({ where: { id }, data });
  },

  deleteMany: async (ids) => {
    return await prisma.category.deleteMany({
      where: { id: { in: ids } },
    });
  },
};

module.exports = { CategoryService };
