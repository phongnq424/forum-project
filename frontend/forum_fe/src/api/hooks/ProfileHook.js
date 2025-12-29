import { useMutation, useQuery } from "@tanstack/react-query";
import profileService from "../services/profileService";

export function useGetMe(token, isEnable = true) {
  return useQuery({
    queryKey: ["profile", "me", token],
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

export function useSearchUsers(query, isEnable = true) {
  return useQuery({
    queryKey: ["profile", "search", query],

    queryFn: (context) => {
      return profileService.searchUsers(context.queryKey[2]);
    },
    enabled: isEnable && query.trim() !== "",
    refetchOnWindowFocus: false,
  });
}
