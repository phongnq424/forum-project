import General from "../../General/General";
import axiosClient from "../AxiosClient";

const commentRatingService = {
  rate: async function (commentId, rating) {
    try {
      const response = await axiosClient.post("/comment-rates/rate", {
        commentId: commentId,
        rating: rating,
      });
      console.warn(response);
      return response;
    } catch (error) {
      console.error(error);
      throw General.createError(error);
    }
  },
};

export default commentRatingService;
