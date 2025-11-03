import { useMutation } from "@tanstack/react-query";
import authService from "../services/authService";
import toastHelper from "../../helper/ToastHelper.jsx";
import { useNavigate } from "react-router-dom";

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: function (data) {
      navigate("/register/verify-otp", {
        state: {
          email: data.email,
        },
      });
    },

    onError: function (error) {
      toastHelper.error(error.message || "Register is unsuccessful!");
    },
  });
}
