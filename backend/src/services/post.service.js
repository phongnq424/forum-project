const { PrismaClient } = require('@prisma/client')
const { CloudinaryService } = require('./cloudinary.service')
const { BlockService } = require('./block.service')
const prisma = new PrismaClient()

const USER_SELECT = { id: true, username: true, avatar: true, fullname: true };
const TOPIC_SELECT = { id: true, name: true };
const IMAGE_SELECT = { id: true, url: true };

const PostService = {
  _enrichPosts: async (posts, viewerId) => {
    if (!posts.length) return [];
    const postIds = posts.map(p => p.id);

    const [commentGroups, reactionGroups, saved, reacted] = await Promise.all([
      prisma.comment.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
      prisma.reaction.groupBy({ by: ['post_id'], where: { post_id: { in: postIds } }, _count: { _all: true } }),
      viewerId ? prisma.postSaved.findMany({ where: { user_id: viewerId, post_id: { in: postIds } }, select: { post_id: true } }) : [],
      viewerId ? prisma.reaction.findMany({ where: { user_id: viewerId, post_id: { in: postIds } }, select: { post_id: true } }) : []
    ]);

    const commentMap = new Map(commentGroups.map(g => [g.post_id, g._count._all]));
    const reactionMap = new Map(reactionGroups.map(g => [g.post_id, g._count._all]));
    const savedSet = new Set(saved.map(s => s.post_id));
    const reactedSet = new Set(reacted.map(r => r.post_id));

    return posts.map(p => ({
      ...p,
      commentCount: commentMap.get(p.id) || 0,
      reactionCount: reactionMap.get(p.id) || 0,
      isSaved: savedSet.has(p.id),
      isReacted: reactedSet.has(p.id),
      _count: undefined
    }));
  },

  /**
   * HELPER: Xử lý logic chặn (Blocking) trong mệnh đề where
   */
  _applyBlockLogic: (where, blockContext) => {
    const blockedIds = blockContext?.blockedUserIds ? Array.from(blockContext.blockedUserIds) : [];
    if (blockedIds.length > 0) {
      where.user_id = where.user_id
        ? { AND: [where.user_id, { notIn: blockedIds }] }
        : { notIn: blockedIds };
    }
    return where;
  },

  createPost: async (userId, payload) => {
    const { content, title, topic_id, files = [] } = payload

    return await prisma.$transaction(async (tx) => {
      const created = await tx.post.create({
        data: {
          content: content || '',
          topic_id: topic_id || null,
          user_id: userId,
          title: title || ''
        }
      });

      if (files.length > 0) {
        const uploaded = [];
        try {
          for (const f of files) {
            const u = await CloudinaryService.upload(f.path, 'post');
            uploaded.push({ url: u.url, public_id: u.public_id, post_id: created.id });
          }
          await tx.image.createMany({ data: uploaded.map(i => ({ url: i.url, post_id: i.post_id, public_id: i.public_id })) });
        } catch (err) {
          await Promise.all(uploaded.map(up => up.public_id && CloudinaryService.delete(up.public_id).catch(() => { })));
          throw err;
        }
      }

      return tx.post.findUnique({
        where: { id: created.id },
        include: { User: { select: USER_SELECT }, Topic: { select: TOPIC_SELECT }, Image: { select: IMAGE_SELECT } }
      });
    });
  },

  getPostById: async (postId, { viewerId, blockContext }) => {
    const post = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      include: {
        User: { select: USER_SELECT },
        Topic: { select: TOPIC_SELECT },
        Image: { select: IMAGE_SELECT },
        Comment: {
          select: {
            id: true,
            comment_detail: true,
            created_at: true,
            User: { select: { id: true, username: true, avatar: true, fullname: true } }
          },
          take: 3,
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!post || (blockContext?.blockedSet?.has(post.user_id))) return null;

    const [enriched] = await PostService._enrichPosts([post], viewerId);
    return enriched;
  },

  updatePost: async (userId, postId, payload) => {
    const { content, title, topic_id, files = [], removeImageIds = [] } = payload;
    const existing = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      include: { Image: true }
    });

    if (!existing || existing.user_id !== userId) throw new Error('Unauthorized or Not Found');

    const uploaded = [];
    try {
      return await prisma.$transaction(async (tx) => {
        if (removeImageIds.length > 0) {
          const toDelete = existing.Image.filter(img => removeImageIds.includes(img.id));
          await tx.image.deleteMany({ where: { id: { in: removeImageIds } } });
          toDelete.forEach(img => CloudinaryService.delete(img.public_id).catch(() => { }));
        }

        for (const f of files) {
          const u = await CloudinaryService.upload(f.path, 'post');
          uploaded.push({ url: u.url, public_id: u.public_id, post_id: postId });
        }
        if (uploaded.length > 0) await tx.image.createMany({ data: uploaded });

        return tx.post.update({
          where: { id: postId },
          data: { content, title, topic_id },
          include: { User: { select: USER_SELECT }, Topic: { select: TOPIC_SELECT }, Image: { select: IMAGE_SELECT } }
        });
      });
    } catch (err) {
      uploaded.forEach(img => CloudinaryService.delete(img.public_id).catch(() => { }));
      throw err;
    }
  },

  deletePost: async (userId, postId) => {
    const existing = await prisma.post.findFirst({ where: { id: postId, is_deleted: false }, include: { Image: true } })
    if (!existing) throw new Error('Post not found')
    if (existing.user_id !== userId) throw new Error('Unauthorized')

    const publicIds = existing.Image.map(i => i.public_id).filter(Boolean)
    await prisma.image.deleteMany({ where: { post_id: postId } })
    await prisma.post.update({
      where: { id: postId },
      data: { is_deleted: true, deleted_at: new Date() }
    })

    for (const pid of publicIds) {
      await CloudinaryService.delete(pid).catch(() => { })
    }

    return
  },

  list: async (query, { viewerId, blockContext }) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    let where = { is_deleted: false };
    if (query.topic_id) where.topic_id = query.topic_id;
    if (query.user_id) where.user_id = query.user_id;
    if (query.category_id) {
      const topics = await prisma.topic.findMany({ where: { category_id: query.category_id }, select: { id: true } });
      where.topic_id = { in: topics.map(t => t.id) };
    }
    if (query.q) {
      where.AND = [
        {
          OR: [
            { content: { contains: query.q, mode: 'insensitive' } },
            { title: { contains: query.q, mode: 'insensitive' } },
            { Topic: { name: { contains: query.q, mode: 'insensitive' } } },
            { User: { username: { contains: query.q, mode: 'insensitive' } } }
          ]
        }
      ];
    }
    where = PostService._applyBlockLogic(where, blockContext);
    let orderBy = { created_at: 'desc' }; // Mặc định Newest
    if (query.sortBy === 'Most Favorite') {
      orderBy = { Reaction: { _count: 'desc' } };
    } else if (query.sortBy === 'Oldest') {
      orderBy = { created_at: 'asc' };
    }
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, skip, take: limit, orderBy,
        include: { User: { select: USER_SELECT }, Topic: { select: TOPIC_SELECT }, Image: { select: IMAGE_SELECT, take: 1 } }
      }),
      prisma.post.count({ where })
    ]);

    const data = await PostService._enrichPosts(posts, viewerId);

    return { data, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  },

  getByUser: async (userIdOwner, query, { viewerId, blockContext }) => {
    if (viewerId && blockContext?.blockedSet.has(userIdOwner)) {
      return { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    }
    return PostService.list({ ...query, user_id: userIdOwner }, { viewerId, blockContext });
  },
}

module.exports = { PostService }