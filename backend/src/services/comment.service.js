const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { emitToPost } = require("../socket/emitter");
const { NotificationService } = require("./notification.service");
const { AIService } = require("./ai.service");

const userSelect = {
  id: true,
  username: true,
  avatar: true,
  fullname: true,
};

const CommentService = {
  createComment: async (
    userId,
    postId,
    commentDetail,
    parentCommentId = null
  ) => {
    if (!commentDetail?.trim()) {
      throw new Error("EMPTY_COMMENT");
    }

    await AIService.assertTextSafe(commentDetail);

    const post = await prisma.post.findFirst({
      where: { id: postId, is_deleted: false },
      select: { id: true, user_id: true },
    });

    if (!post) throw new Error("POST_NOT_FOUND");

    let parentComment = null;

    if (parentCommentId) {
      parentComment = await prisma.comment.findFirst({
        where: { id: parentCommentId, is_deleted: false },
        select: { id: true, post_id: true, user_id: true },
      });

      if (!parentComment) throw new Error("PARENT_COMMENT_NOT_FOUND");
      if (parentComment.post_id !== postId)
        throw new Error("INVALID_PARENT_COMMENT");
    }

    const comment = await prisma.comment.create({
      data: {
        user_id: userId,
        post_id: postId,
        comment_detail: commentDetail,
        parentComment_id: parentCommentId,
      },
      include: {
        User: { select: userSelect },
      },
    });

    if (!parentCommentId && post.user_id !== userId) {
      await NotificationService.create({
        user_id: post.user_id,
        actor_id: userId,
        type: "POST_COMMENT",
        title: "New Comment",
        message: `${comment?.User?.username ?? "?"} commented on your post`,
        ref_id: postId,
        ref_sub_id: comment.id,
      });
    }

    if (parentCommentId && parentComment.user_id !== userId) {
      await NotificationService.create({
        user_id: parentComment.user_id,
        actor_id: userId,
        type: "COMMENT_REPLY",
        title: "New Comment Reply",
        message: `${comment?.User?.username ?? "?"} replied to your comment`,
        ref_id: postId,
        ref_sub_id: comment.id,
      });
    }

    emitToPost(postId, "comment:new", {
      postId,
      comment,
    });

    return comment;
  },

  getCommentsByPost: async (postId) => {
    const parents = await prisma.comment.findMany({
      where: {
        post_id: postId,
        parentComment_id: null,
        is_deleted: false,
      },
      include: {
        User: { select: userSelect },
        childComments: {
          where: { is_deleted: false },
          orderBy: { created_at: "asc" },
          include: {
            User: { select: userSelect },
          },
        },
      },
      orderBy: { created_at: "asc" },
    });

    if (!parents || parents.length === 0) return [];

    const parentIds = parents.map((p) => p.id);
    const childIds = parents.flatMap((p) =>
      (p.childComments || []).map((c) => c.id)
    );
    const allIds = [...parentIds, ...childIds];

    const rateStats = await prisma.comment_Rate.groupBy({
      by: ["comment_id"],
      where: { comment_id: { in: allIds } },
      _sum: { rating: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const statsMap = {};
    rateStats.forEach((r) => {
      statsMap[r.comment_id] = {
        total: r._sum.rating ?? 0,
        count: r._count.rating ?? 0,
        average: r._avg.rating ? Number(r._avg.rating.toFixed(2)) : 0,
      };
    });

    const attachStats = (c) => {
      const s = statsMap[c.id] || { total: 0, count: 0, average: 0 };
      c.stats = s;
      return c;
    };

    const result = parents.map((p) => {
      const parent = attachStats(p);
      if (parent.childComments && parent.childComments.length) {
        parent.childComments = parent.childComments.map((cc) =>
          attachStats(cc)
        );
      }
      return parent;
    });

    return result;
  },

  updateComment: async (userId, commentId, commentDetail) => {
    if (!commentDetail?.trim()) {
      throw new Error("EMPTY_COMMENT");
    }

    const existing = await prisma.comment.findFirst({
      where: { id: commentId, is_deleted: false },
      select: { id: true, user_id: true, post_id: true },
    });

    if (!existing) throw new Error("COMMENT_NOT_FOUND");
    if (existing.user_id !== userId) throw new Error("UNAUTHORIZED");

    await AIService.assertTextSafe(commentDetail);
    const comment = await prisma.comment.update({
      where: { id: commentId, is_deleted: false },
      data: { comment_detail: commentDetail },
    });

    emitToPost(existing.post_id, "comment:update", {
      postId: existing.post_id,
      comment,
    });

    return comment;
  },

  deleteComment: async (userId, commentId) => {
    const existing = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, user_id: true, post_id: true },
    });

    if (!existing) throw new Error("COMMENT_NOT_FOUND");
    if (existing.user_id !== userId) throw new Error("UNAUTHORIZED");

    await prisma.$transaction([
      prisma.comment.update({
        where: { id: commentId },
        data: {
          is_deleted: true,
          comment_detail: "[deleted]",
        },
      }),
      prisma.comment_Rate.deleteMany({
        where: { comment_id: commentId },
      }),
    ]);

    emitToPost(existing.post_id, "comment:delete", {
      postId: existing.post_id,
      commentId,
    });

    return { deleted: true };
  },
};

module.exports = { CommentService };
