import General from "../../General/General";
import axiosClient from "../AxiosClient";

const profileService = {
  getMe: async function () {
    try {
      const response = await axiosClient.get("/profiles/me");
      console.log(response);
      const result = {
        user_id: response.user_id,
        fullName: response.fullname,
        username: response.User.username,
        avatar: response.avatar,
        cover: response.cover,
        bio: response.bio,
        followers: -1,
        following: -1,
        posts: -1,
        comments: -1,
        isOwnProfile: true,
        isFollowing: false,
        gender: response.gender,
      };
      return result;
    } catch (error) {
      throw General.createError(error);
    }
  },

  updateMe: async function (data) {
    try {
      const request = new FormData();
      request.append("fullname", data.fullName);
      request.append("bio", data.bio);
      request.append("gender", data.gender.toUpperCase());
      request.append("dob", data.dob.toISOString());

      if (data.avatar) {
        request.append("avatar", data.avatar);
      }
      if (data.cover) {
        request.append("cover", data.cover);
      }
      const response = await axiosClient.put("/profiles/me", request, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response;
    } catch (error) {
      throw General.createError(error);
    }
  },

  async getUserProfileById(id) {
    try {
      const response = await axiosClient.get(`/profiles/${id}`);
      console.log(response);
      const result = {
        user_id: response.user_id,
        fullName: response.fullname,
        username: response.User.username,
        avatar: response.avatar,
        cover: response.cover,
        bio: response.bio,
        followers: -1,
        following: -1,
        posts: -1,
        comments: -1,
        isOwnProfile: false,
        isFollowing: false,
      };
      return result;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default profileService;
