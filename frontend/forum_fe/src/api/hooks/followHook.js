import { useMutation, useQuery } from "@tanstack/react-query";
import followService from "../services/followService";

export const useGetFollowingByUserId = function (
  userId,
  page,
  tabId,
  isEnable = true
) {
  return useQuery({
    queryKey: ["following", userId, page, tabId],
    queryFn: function (context) {
      return followService.getFollowingByUserId(
        context.queryKey[1],
        context.queryKey[2]
      );
    },
    enabled: userId != "" && isEnable,
  });
};

export const useGetFollowersByUserId = function (
  userId,
  page,
  tabId,
  isEnable = true
) {
  return useQuery({
    queryKey: ["followers", userId, page, tabId],
    queryFn: function (context) {
      return followService.getFollowersByUserId(
        context.queryKey[1],
        context.queryKey[2]
      );
    },
    enabled: userId != "" && isEnable,
  });
};

export const useToggleFollow = function () {
  return useMutation({
    mutationFn: function ({ targetUserId }) {
      return followService.toggle(targetUserId);
    },
  });
};

export const useRemoveFollower = function () {
  return useMutation({
    mutationFn: function ({ followerId }) {
      return followService.removeFollower(followerId);
    },
  });
};
