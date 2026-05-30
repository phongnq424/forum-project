const { PrismaClient } = require("@prisma/client");
const { CloudinaryService } = require("./cloudinary.service");

const prisma = new PrismaClient();

const USER_SELECT = { id: true, username: true, avatar: true, fullname: true };
const TOPIC_SELECT = { id: true, name: true, slug: true };
const IMAGE_SELECT = { id: true, url: true };

function parseTopicIds(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return [...new Set(value.filter(Boolean).map(String))];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return [...new Set(parsed.filter(Boolean).map(String))];
      }
    } catch (e) {
      return [
        ...new Set(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];
    }
  }

  return [];
}

function buildPostInclude(imageTake) {
  const imageInclude =
    imageTake === 1
      ? { select: IMAGE_SELECT, take: 1 }
      : { select: IMAGE_SELECT };

  return {
    User: { select: USER_SELECT },
    topic: { select: TOPIC_SELECT },
    PostTopics: {
      include: {
        Topic: { select: TOPIC_SELECT },
      },
    },
    Image: imageInclude,
  };
}

function normalizePost(post) {
  if (!post) return post;

  return {
    ...post,
    primaryTopic: post.topic || null,
    topics: post.PostTopics ? post.PostTopics.map((item) => item.Topic) : [],
    topic: undefined,
    PostTopics: undefined,
  };
}

const PostService = {
  _enrichPosts: async (posts, viewerId) => {
    if (!posts.length) return [];

    const postIds = posts.map((p) => p.id);

    const [commentGroups, reactionGroups, saved, reacted] = await Promise.all([
      prisma.comment.groupBy({
        by: ["post_id"],
        where: { post_id: { in: postIds } },
        _count: { _all: true },
      }),
      prisma.reaction.groupBy({
        by: ["post_id"],
        where: { post_id: { in: postIds } },
        _count: { _all: true },
      }),
      viewerId
        ? prisma.postSaved.findMany({
          where: { user_id: viewerId, post_id: { in: postIds } },
          select: { post_id: true },
        })
        : [],
      viewerId
        ? prisma.reaction.findMany({
          where: { user_id: viewerId, post_id: { in: postIds } },
          select: { post_id: true },
        })
        : [],
    ]);

    const commentMap = new Map(commentGroups.map((g) => [g.post_id, g._count._all]));
    const reactionMap = new Map(reactionGroups.map((g) => [g.post_id, g._count._all]));
    const savedSet = new Set(saved.map((s) => s.post_id));
    const reactedSet = new Set(reacted.map((r) => r.post_id));

    return posts.map((post) => {
      const p = normalizePost(post);
      const isOwner = viewerId ? p.user_id === viewerId : false;

      return {
        ...p,
        commentCount: commentMap.get(p.id) || 0,
        reactionCount: reactionMap.get(p.id) || 0,
        isSaved: savedSet.has(p.id),
        isReacted: reactedSet.has(p.id),
        permissions: {
          canEdit: isOwner,
          canDelete: isOwner,
        },
        _count: undefined,
      };
    });
  },

  _applyBlockLogic: (where, blockContext) => {
    const blockedIds = blockContext?.blockedUserIds
      ? Array.from(blockContext.blockedUserIds)
      : [];

    if (blockedIds.length > 0) {
      where.user_id = where.user_id
        ? { AND: [where.user_id, { notIn: blockedIds }] }
        : { notIn: blockedIds };
    }

    return where;
  },

  createPost: async (userId, payload) => {
    const {
      content,
      title,
      topic_id,
      topicId,
      topic_ids,
      topicIds,
      files = [],
      moderationEnabled = false,
    } = payload;

    const primaryTopicId = topicId || topic_id || null;
    let allTopicIds = parseTopicIds(topicIds || topic_ids);

    if (primaryTopicId && !allTopicIds.includes(primaryTopicId)) {
      allTopicIds.unshift(primaryTopicId);
    }

    return await prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          content: content || "",
          topicId: primaryTopicId,
          user_id: userId,
          title: title || "",
          moderation_status: moderationEnabled ? "PENDING" : "APPROVED",
          PostTopics:
            allTopicIds.length > 0
              ? {
                create: allTopicIds.map((id) => ({
                  topic_id: id,
                })),
              }
              : undefined,
        },
      });

      if (files.length > 0) {
        const uploaded = [];

        try {
          for (const f of files) {
            const u = await CloudinaryService.upload(f.path, "post");
            uploaded.push({
              url: u.url,
              public_id: u.public_id,
              post_id: created.id,
            });
          }

          await tx.image.createMany({
            data: uploaded.map((item) => ({
              url: item.url,
              post_id: item.post_id,
              public_id: item.public_id,
            })),
          });
        } catch (err) {
          await Promise.all(
            uploaded.map((item) =>
              item.public_id
                ? CloudinaryService.delete(item.public_id).catch(() => { })
                : Promise.resolve()
            )
          );
          throw err;
        }
      }

      return await tx.post.findUnique({
        where: { id: created.id },
        include: buildPostInclude(),
      });
    });
  },

  getPostById: async (postId, { viewerId, blockContext }) => {
    const post = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      include: {
        ...buildPostInclude(),
        Comment: {
          select: {
            id: true,
            comment_detail: true,
            created_at: true,
            User: {
              select: {
                id: true,
                username: true,
                avatar: true,
                fullname: true,
              },
            },
          },
          take: 3,
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!post || blockContext?.blockedSet?.has(post.user_id)) return null;

    const [enriched] = await PostService._enrichPosts([post], viewerId);
    return enriched;
  },

  updatePost: async (userId, postId, payload) => {
    const {
      content,
      title,
      topic_id,
      topicId,
      topic_ids,
      topicIds,
      files = [],
      removeImageIds = [],
    } = payload;

    const existing = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      include: { Image: true },
    });

    if (!existing) throw new Error("Post not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");

    const primaryTopicId =
      topicId !== undefined ? topicId : topic_id !== undefined ? topic_id : undefined;

    const hasTopicIdsPayload = topicIds !== undefined || topic_ids !== undefined;
    let allTopicIds = parseTopicIds(topicIds || topic_ids);

    if (primaryTopicId && !allTopicIds.includes(primaryTopicId)) {
      allTopicIds.unshift(primaryTopicId);
    }

    const uploaded = [];

    try {
      return await prisma.$transaction(async (tx) => {
        if (removeImageIds.length > 0) {
          const toDelete = existing.Image.filter((img) =>
            removeImageIds.includes(img.id)
          );

          await tx.image.deleteMany({
            where: { id: { in: removeImageIds } },
          });

          toDelete.forEach((img) => {
            if (img.public_id) {
              CloudinaryService.delete(img.public_id).catch(() => { });
            }
          });
        }

        for (const f of files) {
          const u = await CloudinaryService.upload(f.path, "post");
          uploaded.push({
            url: u.url,
            public_id: u.public_id,
            post_id: postId,
          });
        }

        if (uploaded.length > 0) {
          await tx.image.createMany({ data: uploaded });
        }

        const updateData = {};

        if (content !== undefined) updateData.content = content;
        if (title !== undefined) updateData.title = title;
        if (primaryTopicId !== undefined) updateData.topicId = primaryTopicId || null;

        await tx.post.update({
          where: { id: postId },
          data: updateData,
        });

        if (hasTopicIdsPayload || primaryTopicId !== undefined) {
          await tx.postTopic.deleteMany({
            where: { post_id: postId },
          });

          if (allTopicIds.length > 0) {
            await tx.postTopic.createMany({
              data: allTopicIds.map((id) => ({
                post_id: postId,
                topic_id: id,
              })),
              skipDuplicates: true,
            });
          }
        }

        return await tx.post.findUnique({
          where: { id: postId },
          include: buildPostInclude(),
        });
      });
    } catch (err) {
      uploaded.forEach((img) => {
        if (img.public_id) {
          CloudinaryService.delete(img.public_id).catch(() => { });
        }
      });
      throw err;
    }
  },

  deletePost: async (userId, postId) => {
    const existing = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      include: { Image: true },
    });

    if (!existing) throw new Error("Post not found");
    if (existing.user_id !== userId) throw new Error("Unauthorized");

    const publicIds = existing.Image.map((item) => item.public_id).filter(Boolean);

    await prisma.image.deleteMany({
      where: { post_id: postId },
    });

    await prisma.post.update({
      where: { id: postId },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });

    for (const publicId of publicIds) {
      await CloudinaryService.delete(publicId).catch(() => { });
    }
  },

  list: async (query, { viewerId, blockContext }) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    let where = {
      is_deleted: false,
      moderation_status: {
        not: "REJECTED",
      },
    };

    if (query.topic_id || query.topicId) {
      const topicId = query.topic_id || query.topicId;

      where.OR = [
        { topicId },
        {
          PostTopics: {
            some: {
              topic_id: topicId,
            },
          },
        },
      ];
    }

    if (query.user_id) {
      where.user_id = query.user_id;
    }

    if (query.category_id) {
      const topics = await prisma.topic.findMany({
        where: {
          category_id: query.category_id,
          is_deleted: false,
          Category: {
            is_deleted: false,
          },
        },
        select: { id: true },
      });

      const topicIds = topics.map((t) => t.id);

      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { topicId: { in: topicIds } },
            {
              PostTopics: {
                some: {
                  topic_id: { in: topicIds },
                },
              },
            },
          ],
        },
      ];
    }

    if (query.q) {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { content: { contains: query.q, mode: "insensitive" } },
            { title: { contains: query.q, mode: "insensitive" } },
            { topic: { name: { contains: query.q, mode: "insensitive" } } },
            {
              PostTopics: {
                some: {
                  Topic: {
                    name: { contains: query.q, mode: "insensitive" },
                  },
                },
              },
            },
            { User: { username: { contains: query.q, mode: "insensitive" } } },
          ],
        },
      ];
    }

    where = PostService._applyBlockLogic(where, blockContext);

    let orderBy = { created_at: "desc" };

    if (query.sortBy === "Most Favorite") {
      orderBy = { Reaction: { _count: "desc" } };
    } else if (query.sortBy === "Oldest") {
      orderBy = { created_at: "asc" };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: buildPostInclude(1),
      }),
      prisma.post.count({ where }),
    ]);

    const data = await PostService._enrichPosts(posts, viewerId);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getByUser: async (userIdOwner, query, { viewerId, blockContext }) => {
    if (viewerId && blockContext?.blockedSet?.has(userIdOwner)) {
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
    }

    return PostService.list(
      { ...query, user_id: userIdOwner },
      { viewerId, blockContext }
    );
  },
};

module.exports = { PostService };