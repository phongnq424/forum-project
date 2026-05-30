const { CommentService } = require("../services/comment.service");

function mapCommentError(e) {
  if (e.message === "CONTENT_VIOLATES_POLICY") {
    return {
      status: 422,
      body: {
        code: "CONTENT_VIOLATES_POLICY",
        message: "Bình luận không phù hợp. Vui lòng chỉnh sửa trước khi đăng.",
      },
    };
  }


  return null;
}

const CommentController = {
  create: async (req, res) => {
    try {
      const userId = req.user.id;
      const { postId, comment_detail, parent_id } = req.body;

      const comment = await CommentService.createComment(
        userId,
        postId,
        comment_detail,
        parent_id
      );

      res.status(201).json(comment);
    } catch (e) {
      const mapped = mapCommentError(e);
      if (mapped) return res.status(mapped.status).json(mapped.body);

      res.status(500).json({ message: e.message });
    }
  },

  listByPost: async (req, res) => {
    try {
      const comments = await CommentService.getCommentsByPost(req.params.postId);
      res.status(200).json(comments);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;
      const { comment_detail } = req.body;

      const updated = await CommentService.updateComment(
        userId,
        commentId,
        comment_detail
      );

      res.status(200).json(updated);
    } catch (e) {
      const mapped = mapCommentError(e);
      if (mapped) return res.status(mapped.status).json(mapped.body);

      if (e.message.includes("Unauthorized"))
        return res.status(403).json({ message: e.message });

      if (e.message.includes("not found"))
        return res.status(404).json({ message: e.message });

      res.status(500).json({ message: e.message });
    }
  },

  delete: async (req, res) => {
    try {
      const userId = req.user.id;
      const commentId = req.params.commentId;

      await CommentService.deleteComment(userId, commentId);

      res.status(200).json({ message: "Deleted" });
    } catch (e) {
      if (e.message.includes("Unauthorized"))
        return res.status(403).json({ message: e.message });

      if (e.message.includes("not found"))
        return res.status(404).json({ message: e.message });

      res.status(500).json({ message: e.message });
    }
  },
};

module.exports = { CommentController };