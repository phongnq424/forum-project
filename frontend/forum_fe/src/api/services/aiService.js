import General from "../../General/General";
import axiosClient from "../AxiosClient";

const aiService = {
  chatbot: async function ({ message }) {
    try {
      const res = await axiosClient.post("ai/chat", { message });
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default aiService;
