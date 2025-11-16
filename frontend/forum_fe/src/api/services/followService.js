import General from "../../General/General";
import axiosClient from "../AxiosClient";

const followService = {
  getFollowingByUserId: async function (userId, page) {
    try {
      const response = await axiosClient.get(`/followers/following/${userId}`, {
        params: {
          page: page,
        },
      });
      const followInfos = response.data.map(function (f, i) {
        return {
          followInfoId: f.id,
          meId: f.follow_id,
          otherId: f.followed.id,
          otherUsername: f.followed.username,
          otherProfile: f.followed.Profile,
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

  getFollowersByUserId: async function (userId, page) {
    try {
      const response = await axiosClient.get(`/followers/followers/${userId}`, {
        params: {
          page: page,
        },
      });
      const followInfos = response.data.map(function (f, i) {
        return {
          followInfoId: f.id,
          otherId: f.follow_id,
          meId: f.follower.id,
          otherUsername: f.follower.username,
          otherProfile: f.follower.Profile,
          isFollowMe: true,
        };
      });

      console.log(followInfos);

      return { data: followInfos, pagination: response.pagination };
    } catch (error) {
      throw General.createError(error);
    }
  },

  removeFollower: async function (followerId) {
    try {
      const config = {
        data: {
          followerId: followerId,
        },
      };
      const response = await axiosClient.delete("/followers/remove", config);
      return response;
      //return { followed: response.followed, followedId: otherUserId };
    } catch (error) {
      throw General.createError(error);
    }
  },
};

export default followService;
