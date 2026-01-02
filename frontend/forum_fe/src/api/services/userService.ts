import General from "@/General/General";
import axiosClient from "../AxiosClient";

const userService = {
  changePassword: async function (
    oldPass: string,
    newPass: string,
    confirmPass: string
  ) {
    try {
      const req = {
        oldPassword: oldPass,
        newPassword: newPass,
        confirmPassword: confirmPass,
      };

      const res = await axiosClient.put("users/me/password", req);
      return res;
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default userService;
