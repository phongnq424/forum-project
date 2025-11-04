import axiosClient from "../AxiosClient";

const userService = {
  getMe: async function () {
    try {
      const response = await axiosClient.get("/users/me");
      return response;
    } catch (err) {
      console.log(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error ||
          error.data?.message ||
          "Verify OTP is unsuccessful!"
      );
    }
  },
};

export default userService;
