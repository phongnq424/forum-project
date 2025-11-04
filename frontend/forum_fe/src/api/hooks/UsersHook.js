import { useQuery } from "@tanstack/react-query";
import userService from "../services/userService";

export function useGetMe(handleOnSuccess, handleOnError, isEnable = true) {
  return useQuery({
    queryKey: ["me", isEnable],

    queryFn: () => {
      return userService.getMe();
    },

    onSuccess: function (response) {
      handleOnSuccess?.(response);
    },

    onError: function (error) {
      handleOnError?.(error);
    },
    enabled: isEnable,
  });
}
