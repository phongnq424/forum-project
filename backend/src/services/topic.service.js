const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function toSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTopicPayload(topic) {
  if (!topic.name) {
    throw new Error("Topic name is required");
  }

  return {
    name: topic.name,
    slug: topic.slug || toSlug(topic.name),
    category_id: topic.category_id,
    parent_id: topic.parent_id || null,
    description: topic.description || null,
    is_deleted: topic.is_deleted ?? false,
  };
}

const TopicService = {
  createMany: async (topics) => {
    const data = topics.map(normalizeTopicPayload);

    return await prisma.topic.createMany({
      data,
      skipDuplicates: true,
    });
  },

  list: async (query) => {
    const page = parseInt(query?.page) || 1;
    const limit = parseInt(query?.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {
      is_deleted: false,
      Category: {
        is_deleted: false,
      },
    };

    if (query?.category_id) where.category_id = query.category_id;
    if (query?.parent_id) where.parent_id = query.parent_id;

    if (query?.q) {
      where.OR = [
        { name: { contains: query.q, mode: "insensitive" } },
        { slug: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }

    const [topics, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          Category: {
            select: { id: true, name: true },
          },
          Parent: {
            select: { id: true, name: true, slug: true },
          },
          Children: {
            where: { is_deleted: false },
            select: { id: true, name: true, slug: true, parent_id: true },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);

    return {
      data: topics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (id) => {
    return await prisma.topic.findFirst({
      where: {
        id,
        is_deleted: false,
        Category: {
          is_deleted: false,
        },
      },
      include: {
        Category: {
          select: { id: true, name: true },
        },
        Parent: {
          select: { id: true, name: true, slug: true },
        },
        Children: {
          where: { is_deleted: false },
          select: { id: true, name: true, slug: true, parent_id: true },
        },
      },
    });
  },

  update: async (id, data) => {
    const existing = await prisma.topic.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });

    if (!existing) return null;

    const updateData = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      if (!data.slug) updateData.slug = toSlug(data.name);
    }

    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.category_id !== undefined) updateData.category_id = data.category_id;
    if (data.parent_id !== undefined) updateData.parent_id = data.parent_id || null;
    if (data.description !== undefined) updateData.description = data.description;

    if (updateData.parent_id === id) {
      throw new Error("Topic cannot be parent of itself");
    }

    return await prisma.topic.update({
      where: { id },
      data: updateData,
      include: {
        Category: {
          select: { id: true, name: true },
        },
        Parent: {
          select: { id: true, name: true, slug: true },
        },
        Children: {
          where: { is_deleted: false },
          select: { id: true, name: true, slug: true, parent_id: true },
        },
      },
    });
  },

  delete: async (ids) => {
    return await prisma.topic.updateMany({
      where: {
        id: { in: ids },
        is_deleted: false,
      },
      data: { is_deleted: true },
    });
  },
};

module.exports = { TopicService };