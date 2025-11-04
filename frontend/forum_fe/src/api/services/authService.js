import axiosClient from "../AxiosClient";

const authService = {
  register: async function (data) {
    try {
      const res = await axiosClient.post("/auth/register", data);
      return res;
    } catch (error) {
      console.error(error.status || "4xx 5xx");
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
      console.error(error.status || "4xx 5xx");
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
      console.error(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error ||
          error.data?.message ||
          "Verification OTP is unsuccessful!"
      );
    }
  },

  login: async function (data) {
    try {
      const request = {
        username: data.username,
        password: data.password,
      };
      const response = await axiosClient.post("/auth/login", request);
      return response;
    } catch (error) {
      console.error(error.status || "4xx 5xx");
      throw new Error(error.data?.error || "Login process is unsuccessful");
    }
  },

  resendOTP: async function (data) {
    try {
      const request = {
        email: data.email,
      };
      const response = await axiosClient.post("/auth/resend-otp", request);
      return response;
    } catch (error) {
      console.error(error.status || "4xx 5xx");
      throw new Error(
        error.data?.error || "Resend OTP process is unsuccessful!"
      );
    }
  },
};

export default authService;
