import General from "../../General/General";
import axiosClient from "../AxiosClient";

const topicService = {
  getTopics: async function (page = 1) {
    try {
      const response = await axiosClient.get("/topics", {
        params: {
          page: page,
        },
      });
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  createMany: async (data) => {
    try {
      const res = await axiosClient.post("/topics", data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // PUT /topics/:id – update 1 topic
  update: async (id, data) => {
    try {
      const res = await axiosClient.put(`/topics/${id}`, data);
      return res;
    } catch (error) {
      General.createError(error);
    }
  },

  // DELETE /topics/:id (nhưng body là ids[])
  deleteMany: async (ids) => {
    try {
      console.log("DELETE", ids);
      const res = await axiosClient.delete("/topics/0", {
        data: { ids },
      });
      return res;
    } catch (error) {
      General.createError(error);
    }
  },
};

export default topicService;
