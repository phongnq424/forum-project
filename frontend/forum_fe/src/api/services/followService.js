import General from "../../General/General";
import axiosClient from "../AxiosClient";

const followService = {
  getFollowingByUserId: async function (userId, page, limit) {
    try {
      const response = await axiosClient.get(`/followers/following/${userId}`, {
        params: {
          page: page,
          limit: limit,
        },
      });
      const followInfos = response.data.map(function (f, i) {
        return {
          followInfoId: f.id,
          followId: f.follow_id,
          followedId: f.followed.id,
          followedUsername: f.followed.username,
          followedProfile: f.followed.Profile,
          isFollowing: true,
        };
      });

      return { data: followInfos, pagination: response.pagination };
    } catch (error) {
      throw General.createError(error);
    }
  },

  toggle: async function (otherUserId) {
    try {
      const request = { targetUserId: otherUserId };
      const response = await axiosClient.post("/followers/toggle", request);
      return { followed: response.followed, followedId: otherUserId };
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default followService;
