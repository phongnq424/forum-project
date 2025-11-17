import General from "../../General/General";
import axiosClient from "../AxiosClient";

const commentRatingService = {
  rate: async function (commentId, rating) {
    try {
      const response = await axiosClient.post("/comment-rating/rate", {
        commentId,
        rating,
      });
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default commentRatingService;
