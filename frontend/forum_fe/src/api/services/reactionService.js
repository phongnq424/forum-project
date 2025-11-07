import General from "../../General/General";
import axiosClient from "../AxiosClient";

const reactionService = {
  toggle: async function (postId, typeReaction = "LOVE") {
    try {
      const request = { postId: postId, type: typeReaction };
      const response = await axiosClient.post("/reactions/toggle", request);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default reactionService;
