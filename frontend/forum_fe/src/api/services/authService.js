import General from "../../General/General";
import axiosClient from "../AxiosClient";

const authService = {
  register: async function (data) {
    try {
      const res = await axiosClient.post("/auth/register", data);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  verifyOTP: async function (data) {
    try {
      const res = await axiosClient.post("/auth/verify-otp", data);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },

  verifyOTP: async function (data) {
    try {
      const res = await axiosClient.post("/auth/verify-otp", data);
      return res;
    } catch (error) {
      throw General.createError(error);
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
      throw General.createError(error);
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
      throw General.createError(error);
    }
  },
};

export default authService;
