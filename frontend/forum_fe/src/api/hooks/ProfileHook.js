import { useMutation, useQuery } from "@tanstack/react-query";
import profileService from "../services/profileService";

export function useGetMe(isEnable = true) {
  return useQuery({
    queryKey: ["profile", "me"],

    queryFn: () => {
      return profileService.getMe();
    },
    enabled: isEnable,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateMe(isEnable = true) {
  return useMutation({
    mutationFn: (data) => profileService.updateMe(data),
  });
}

export function useGetProfileByUserId(userId, isEnable = true) {
  return useQuery({
    queryKey: ["profile", userId],

    queryFn: (context) => {
      if (context.queryKey[1] !== "") {
        return profileService.getUserProfileById(context.queryKey[1]);
      } else {
        return profileService.getMe();
      }
    },
    enabled: isEnable,
    refetchOnWindowFocus: false,
  });
}
