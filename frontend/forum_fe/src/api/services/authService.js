import General from "../../General/General";
import tokenHelper from "../../helper/TokenHelper";
import axiosClient from "../AxiosClient";

const authService = {
  register: async function (data) {
    try {
      const res = await axiosClient.post("/auth/register", data);
      return res;
    } catch (error) {

      const err = General.createError(error);
      console.error("Login error:", err);
      throw err;
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
      tokenHelper.setToken(response.token);
      return response;
    } catch (error) {
      const err = General.createError(error);
      console.error("Login error:", err);
      throw err;
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

  logOut: async function () {
    try {
      var token = localStorage.getItem("token");
      const request = { token };
      const result = await axiosClient.post("/auth/logout", request);
      tokenHelper.removeToken();
      return result;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default authService;
