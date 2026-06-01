export interface ToggleFollowPayload {
    targetUserId: string;
}

export interface ToggleFollowResponse {
    followed: boolean;
}

export interface RemoveFollowerPayload {
    followerId: string;
}

export interface RemoveFollowerResponse {
    removed: boolean;
}

export interface FollowUser {
    id: string;
    username: string;
    fullname?: string | null;
    avatar?: string | null;
    Profile?: {
        avatar?: string | null;
    } | null;
}

export interface FollowerItem {
    id?: string;
    follow_id?: string;
    followed_id?: string;
    follower: FollowUser;
}

export interface FollowingItem {
    id?: string;
    follow_id?: string;
    followed_id?: string;
    followed: FollowUser;
}

export interface FollowListParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface FollowPagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface FollowersResponse {
    data: FollowerItem[];
    pagination: FollowPagination;
}

export interface FollowingResponse {
    data: FollowingItem[];
    pagination: FollowPagination;
}