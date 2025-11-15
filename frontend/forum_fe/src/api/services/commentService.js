import General from "../../General/General";
import axiosClient from "../AxiosClient";

const commentService = {
  async getCommentsOfPost(postId) {
    const responses = await axiosClient.get(`/comments/post/${postId}`);
    const results = [];
    const change = function (from) {
      const to = {
        id: from.id,
        userId: from.user_id,
        postId: from.post_id,
        parentCommentId: from.parentComment_id,
        content: from.comment_detail,
        createAt: new Date(from.created_at).toLocaleDateString(),
        updateAt: new Date(from.update_at).toLocaleDateString(),
        user: from.User,
        childComments: from.childComments?.map((item) => change(item)),
      };

      return to;
    };

    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      results.push(change(response));
    }

    console.log(results);
    return results;
  },

  async addComment(postId, parentComment_id, comment_detail) {
    try {
      const request = { postId, parentComment_id, comment_detail };
      const response = await axiosClient.post("/comments", request);
      return response;
    } catch (error) {
      console.error(error);
      throw General.createError(error);
    }
  },

  async delete(cmtId) {
    try {
      const response = await axiosClient.delete(`/comments/${cmtId}`);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  async updateComment(id, content) {
    try {
      const response = await axiosClient.put(`/comments/${id}`, {
        comment_detail: content,
      });
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default commentService;
