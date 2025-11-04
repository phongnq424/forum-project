import { useQuery } from "@tanstack/react-query";
import profileService from "../services/ProfileService";

export function useGetMe(isEnable = true) {
  return useQuery({
    queryKey: ["me"],

    queryFn: () => {
      return profileService.getMe();
    },
    enabled: isEnable,
  });
}
