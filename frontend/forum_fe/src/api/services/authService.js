import axiosClient from "../AxiosClient";

const authService = {
  register: async function (data) {
    try {
      const res = await axiosClient.post("/auth/register", data);
      return res;
    } catch (error) {
      console.log(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error || error.data?.message || "Register is unsuccessful!"
      );
    }
  },

  verifyOTP: async function (data) {
    try {
      const res = await axiosClient.post("/auth/verify-otp", data);
      return res;
    } catch (error) {
      console.log(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error ||
          error.data?.message ||
          "Verify OTP is unsuccessful!"
      );
    }
  },

  verifyOTP: async function (data) {
    try {
      const res = await axiosClient.post("/auth/verify-otp", data);
      return res;
    } catch (error) {
      console.log(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error ||
          error.data?.message ||
          "Verify OTP is unsuccessful!"
      );
    }
  },

  login: function (data) {
    try {
      const request = {
        username: data.username,
        password: data.password,
      };
    } catch (err) {
      console.log(err.status || "4xx 5xx");
      throw new Error(err.data?.error || "Login is unsuccessful");
    }
  },
};

export default authService;
