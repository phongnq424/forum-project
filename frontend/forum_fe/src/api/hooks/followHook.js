import { useMutation, useQuery } from "@tanstack/react-query";
import followService from "../services/followService";

export const useGetFollowingByUserId = function (userId, page, limit) {
  return useQuery({
    queryKey: ["following", userId, page, limit],
    queryFn: function (context) {
      return followService.getFollowingByUserId(
        context.queryKey[1],
        context.queryKey[2],
        context.queryKey[3]
      );
    },
    enabled: userId != "",
  });
};

export const useToggleFollow = function () {
  return useMutation({
    mutationFn: function ({ targetUserId }) {
      return followService.toggle(targetUserId);
    },
  });
};
