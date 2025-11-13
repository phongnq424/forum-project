import { useMutation, useQuery } from "@tanstack/react-query";
import profileService from "../services/profileService";

export function useGetMe(isEnable = true) {
  return useQuery({
    queryKey: ["me"],

    queryFn: () => {
      return profileService.getMe();
    },
    enabled: isEnable,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateMe(isEnable = true) {
  return useMutation({
    mutationFn: (data) => profileService.updateMe(data),
  });
}
