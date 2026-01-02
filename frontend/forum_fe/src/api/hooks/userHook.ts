import { useMutation } from "@tanstack/react-query";
import userService from "../services/userService";

export const useChangePassword = function () {
  return useMutation({
    mutationFn: function (data: {
      newPassword: string;
      confirmPassword: string;
      oldPassword: string;
    }) {
      if (data.newPassword !== data.confirmPassword) {
        throw new Error("Password do not match");
      }

      return userService.changePassword(
        data.oldPassword,
        data.newPassword,
        data.confirmPassword
      );
    },
  });
};
