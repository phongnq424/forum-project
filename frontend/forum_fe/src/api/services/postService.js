import { Form } from "react-hook-form";
import axiosClient from "../AxiosClient";
import General from "../../General/General";

const postService = {
  createPost: async function (data) {
    try {
      console.log(data);
      const request = new FormData();
      request.append("title", data.postTitle);
      request.append("content", data.postContent);
      request.append("topic_id", data.topic);

      const images = data.images;

      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          request.append("images", images[i]);
        }
      }

      console.warn(data);
      const response = await axiosClient.post("/posts", request, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.log(error);
      throw General.createError(error);
    }
  },

  getPosts: async function () {
    try {
      const response = await axiosClient.get("/posts");
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default postService;
