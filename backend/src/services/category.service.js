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

    const where = {
      is_deleted: false,
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          Topic: {
            where: { is_deleted: false },
            select: { id: true, name: true, description: true },
          },
        },
      }),
      prisma.category.count({ where }),
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
    return await prisma.category.findFirst({
      where: {
        id: id,
        is_deleted: false,
      },
      include: {
        Topic: {
          where: { is_deleted: false },
          select: { id: true, name: true, description: true },
        },
      },
    });
  },

  update: async (id, data) => {
    return await prisma.category.updateMany({
      where: {
        id: id,
        is_deleted: false,
      },
      data,
    });
  },

  deleteMany: async (ids) => {
    return await prisma.$transaction(async (tx) => {

      await tx.category.updateMany({
        where: { id: { in: ids } },
        data: { is_deleted: true }
      });

      await tx.topic.updateMany({
        where: { category_id: { in: ids } },
        data: { is_deleted: true }
      });

      return { count: ids.length };
    });
  }
};

module.exports = { CategoryService };