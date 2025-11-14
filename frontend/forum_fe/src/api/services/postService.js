import { Form } from "react-hook-form";
import axiosClient from "../AxiosClient";
import General from "../../General/General";

const postService = {
  createPost: async function (data) {
    try {
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

  update: async function (data) {
    try {
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

      const result = await axiosClient.put(`/posts/${data.id}`, request, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const response = {
        id: result.id,
        author: result.User.username,
        authorImg: result.User.Profile.avatar,
        date: new Date(result.created_at).toLocaleDateString(),
        title: result.title,
        description: result.content,
        likes: -1,
        comments: -1,
        images: result.Image || [],
        thumbnail: result.Image.length > 0 ? result.Image[0].url : null,
        isLiked: false,
        isSaved: false,
        topic: result.Topic,
        user: result.User,
      };
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  getPosts: async function () {
    try {
      const response = await axiosClient.get("/posts");
      const ps = [];
      for (let i = 0; i < response.data.length; i++) {
        const curr = response.data[i];

        ps.push({
          id: curr.id,
          author: curr.User.username,
          authorImg: curr.User.Profile.avatar,
          date: new Date(curr.created_at).toLocaleDateString(),
          title: curr.title,
          description: curr.content,
          likes: -1,
          comments: -1,
          images: curr.Image || [],
          thumbnail: curr.Image.length > 0 ? curr.Image[0].url : null,
          isLiked: false,
          isSaved: false,
          topic: curr.Topic,
          user: curr.User,
        });
      }
      console.log("thành công");
      return { data: ps, pagination: response.pagination };
    } catch (error) {
      throw General.createError(error);
    }
  },

  async getPostById(postId) {
    try {
      const result = await axiosClient.get(`/posts/${postId}`);
      const response = {
        id: result.id,
        author: result.User.username,
        authorImg: result.User.Profile.avatar,
        date: new Date(result.created_at).toLocaleDateString(),
        title: result.title,
        description: result.content,
        likes: -1,
        comments: -1,
        images: result.Image || [],
        thumbnail: result.Image.length > 0 ? result.Image[0].url : null,
        isLiked: false,
        isSaved: false,
        topic: result.Topic,
        user: result.User,
      };
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  async save(postId) {
    try {
      const response = await axiosClient.post(`/post-saved/toggle/${postId}`);
      response.postId = postId;
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  async delete(postId) {
    try {
      const response = await axiosClient.delete(`/posts/${postId}`);
      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  getPostOfUser: async function (userId) {
    try {
      const response = await axiosClient.get(`/posts/user/${userId}`);
      const ps = [];
      for (let i = 0; i < response.data.length; i++) {
        const curr = response.data[i];
        ps.push({
          id: curr.id,
          author: curr.User?.username || "",
          authorImg: curr.User?.Profile?.avatar || "",
          date: new Date(curr.created_at).toLocaleDateString(),
          title: curr.title,
          description: curr.content,
          likes: -1,
          comments: -1,
          images: curr.Image || [],
          thumbnail: curr.Image.length > 0 ? curr.Image[0].url : null,
          isLiked: false,
          isSaved: false,
          topic: curr.Topic,
          user: curr.User,
        });
      }

      return { data: ps, pagination: response.pagination };
    } catch (error) {
      throw General.createError(error);
    }
  },

  useGetPostBySearchKey: async function (searchKey, categoryId) {
    try {
      const response = await axiosClient.get(`/posts/search`, {
        params: {
          q: searchKey,
          cate: categoryId,
        },
      });
      const ps = [];
      for (let i = 0; i < response.length; i++) {
        const curr = response[i];

        ps.push({
          id: curr.id,
          author: curr.User.username,
          authorImg: curr.User.Profile.avatar,
          date: new Date(curr.created_at).toLocaleDateString(),
          title: curr.title,
          description: curr.content,
          likes: -1,
          comments: -1,
          images: curr.Image || [],
          thumbnail: curr.Image.length > 0 ? curr.Image[0].url : null,
          isLiked: false,
          isSaved: false,
          topic: curr.Topic,
          user: curr.User,
        });
      }
      console.log("thành công");
      return { data: ps, pagination: response.pagination };
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default postService;
