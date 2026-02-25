export interface UserBasic {
    id: string;
    username: string;
    email: string;
    fullname?: string;
    avatar?: string;
    role: string;
    created_at: string;
}

export interface Profile {
    id: string;
    user_id: string;
    bio?: string;
    cover?: string;
    dob?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    location?: string;
    User: UserBasic;
    postCount: number;
    commentCount: number;
    followingCount: number;
    followerCount: number;
    isFollowing: boolean;
}

export interface UpdateProfileDTO {
    fullname?: string;
    bio?: string;
    location?: string;
    gender?: string;
    dob?: string;
    avatar?: File;
    cover?: File;
}