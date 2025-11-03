import { useMutation } from "@tanstack/react-query";
import authService from "../services/authService";

export function useRegister(handleOnSuccess, handleOnError) {
  return useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: function (data) {
      handleOnSuccess(data);
    },

    onError: function (error) {
      handleOnError(error);
    },
  });
}

export function useVerifyOTP(handleOnSuccess, handleOnError) {
  return useMutation({
    mutationFn: function (data) {
      const request = {
        otp: data.otp,
      };

      return authService.verifyOTP(request);
    },

    onSuccess: function (response) {
      handleOnSuccess(response);
    },

    onError: function (error) {
      handleOnError(error);
    },
  });
}

export function useLogin(handleOnSuccess, handleOnError) {
  return useMutation({
    mutationFn: function (data) {
      authService.login(data);
    },
    onSuccess: function (response) {
      handleOnSuccess(response);
    },
    onError: function (error) {
      handleOnError(error);
    },
  });
}
