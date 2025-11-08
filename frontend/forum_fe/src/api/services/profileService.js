import General from "../../General/General";
import axiosClient from "../AxiosClient";

const profileService = {
  getMe: async function () {
    try {
      const response = await axiosClient.get("/profiles/me");
      return response;
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
};

export default profileService;
