import axiosClient from "../AxiosClient";

const blockService = {
  blockUser: async function (blockedUserId: string) {
    const req = await axiosClient.post("/block", {
      targetUserId: blockedUserId,
    });
    return req;
  },
};

export default blockService;
