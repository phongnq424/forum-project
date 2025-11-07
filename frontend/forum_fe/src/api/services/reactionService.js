import General from "../../General/General";
import axiosClient from "../AxiosClient";

const reactionService = {
  toggle: async function (postId, typeReaction = "LOVE") {
    try {
      const query = new URLSearchParams({
        postId: postId,
        type: typeReaction,
      }).toString();
      const response = await axiosClient.post(`/reactions/toggle?${query}`);
      return response;
    } catch (error) {
      console.log(error);
      throw General.createError(error);
    }
  },
};

export default reactionService;
