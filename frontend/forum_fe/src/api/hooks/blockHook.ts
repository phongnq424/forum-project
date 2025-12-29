import { useMutation, useQuery } from "@tanstack/react-query";
import blockService from "../services/blockService";

export const useBlockUser = function () {
  return useMutation({
    mutationFn: async function ({ targetUserId }: { targetUserId: string }) {
      return await blockService.blockUser(targetUserId);
    },
  });
};

export const useGetBlockUser = function (
  userId: string,
  page: number,
  tabId: string,
  isEnable = true
) {
  return useQuery({
    queryKey: ["blocked-users", userId, page, tabId],
    queryFn: function (context: any) {
      return blockService.getBlockedUsers(
        context.queryKey[1],
        context.queryKey[2]
      );
    },
    enabled: userId != "" && isEnable,
  });
};
