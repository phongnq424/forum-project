import General from "@/General/General";
import axiosClient from "../AxiosClient";

const blockService = {
  blockUser: async function (blockedUserId: string) {
    try {
      const req = await axiosClient.post("/blocks/toggle", {
        targetUserId: blockedUserId,
      });
      return req;
    } catch (error: any) {
      console.error(General.createError(error));
      throw General.createError(error);
    }
  },

  getBlockedUsers: async function (userId: string, page: number) {
    try {
      const response = await axiosClient.get(`/blocks/blocked`, {
        params: {
          page: page,
        },
      });

      //
      const blockedUsers = response.data.map(function (bl: any, i: number) {
        return {
          blockedInfoId: "",
          otherId: bl?.id,
          meId: "",
          otherUsername: bl?.username,
          otherProfile: bl?.Profile,
          isBlocked: true,
        };
      });
      //
      return {
        data: blockedUsers,
        pagination: (response as any).pagination,
      };
    } catch (error: any) {
      console.error(General.createError(error));
      throw General.createError(error);
    }
  },
};

export default blockService;
