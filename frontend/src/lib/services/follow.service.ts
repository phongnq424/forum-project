import { api } from "$lib/services/api";
import { ENDPOINTS } from "$lib/constants";
import type {
    FollowListParams,
    FollowersResponse,
    FollowingResponse,
    RemoveFollowerResponse,
    ToggleFollowResponse,
} from "$lib/types/follow.type";

export const followService = {
    toggleFollow(targetUserId: string): Promise<ToggleFollowResponse> {
        return api.post<ToggleFollowResponse>(ENDPOINTS.FOLLOWERS.TOGGLE, {
            targetUserId,
        });
    },

    removeFollower(followerId: string): Promise<RemoveFollowerResponse> {
        return api.delete<RemoveFollowerResponse>(ENDPOINTS.FOLLOWERS.REMOVE, {
            data: {
                followerId,
            },
        });
    },

    getFollowers(
        userId: string,
        params: FollowListParams = {},
    ): Promise<FollowersResponse> {
        return api.get<FollowersResponse>(
            ENDPOINTS.FOLLOWERS.FOLLOWERS_BY_USER(userId),
            { params },
        );
    },

    getFollowing(
        userId: string,
        params: FollowListParams = {},
    ): Promise<FollowingResponse> {
        return api.get<FollowingResponse>(
            ENDPOINTS.FOLLOWERS.FOLLOWING_BY_USER(userId),
            { params },
        );
    },
};