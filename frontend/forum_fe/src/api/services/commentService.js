import General from "../../General/General";
import axiosClient from "../AxiosClient";

const commentService = {
  async getCommentsOfPost(postId) {
    const responses = await axiosClient.get(`/comments/post/${postId}`);
    const results = [];
    let item;
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      results.push({
        id: response.id,
        userId: response.user_id,
        postId: response.post_id,
        parentCommentId: response.parentComment_id,
        content: response.comment_detail,
        createAt: new Date(response.created_at).toLocaleDateString(),
        updateAt: new Date(response.update_at).toLocaleDateString(),
        user: response.User,
        childComments: response.childComments,
      });
    }
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
};

export default commentService;
