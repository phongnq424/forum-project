import General from "../../General/General";
import axiosClient from "../AxiosClient";

const topicService = {
  getTopics: async function () {
    try {
      const response = await axiosClient.get("/topics");
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default topicService;
