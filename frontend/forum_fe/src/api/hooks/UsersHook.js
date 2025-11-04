import { useQuery } from "@tanstack/react-query";
import userService from "../services/userService";

export function useGetMe(isEnable = true) {
  return useQuery({
    queryKey: ["me"],

    queryFn: () => {
      return userService.getMe();
    },
    enabled: isEnable,
  });
}
