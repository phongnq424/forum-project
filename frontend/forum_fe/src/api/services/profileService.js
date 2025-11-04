import axiosClient from "../AxiosClient";

const profileService = {
  getMe: async function () {
    try {
      const response = await axiosClient.get("/profiles/me");
      return response;
    } catch (error) {
      console.error(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error ||
          error.data?.message ||
          "Get your profile process is unsuccessful!"
      );
    }
  },
};

export default profileService;
