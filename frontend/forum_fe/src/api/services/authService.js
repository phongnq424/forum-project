import axiosClient from "../AxiosClient";

const authService = {
  register: async function (data) {
    try {
      console.log(data);
      const res = await axiosClient.post("/auth/register", data);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Register is unsuccessful!"
      );
    }
  },

  verifyOTP: async function (data) {
    try {
      console.log(data);
      const res = await axiosClient.post("/auth/verify-otp", data);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Verify OTP is unsuccessful!"
      );
    }
  },
};

export default authService;
