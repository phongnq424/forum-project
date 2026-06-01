import type { Pagination } from "./common.type";

export interface PostTopic {
    id: string;
    name: string;
    slug?: string;
}

export interface PostImage {
    id: string;
    url: string;
}

export interface PostUser {
    id: string;
    username: string;
    fullname?: string;
    avatar: string | null;
}

export interface Post {
    id: string;
    user_id: string;

    topicId?: string | null;
    topic_id?: string | null;

    title: string;
    content?: string;
    created_at: string;
    updated_at: string;
    is_deleted?: boolean;
    deleted_at?: string | null;

    commentCount: number;
    reactionCount: number;
    isSaved: boolean;
    isReacted: boolean;

    User: PostUser;

    primaryTopic?: PostTopic | null;
    topics?: PostTopic[];

    topic?: PostTopic | null;
    Topic?: PostTopic | null;

    PostTopics?: {
        Topic?: PostTopic | null;
    }[];

    Image: PostImage[];

    permissions: {
        canEdit: boolean;
        canDelete: boolean;
    };
}

export interface PaginatedPostResponse {
    data: Post[];
    pagination: Pagination;
}

export interface PostCreatePayload {
    topicId: string;
    topicIds: string[];
    title: string;
    content: string;
    images?: File[] | FileList | null;
}

export interface PostUpdatePayload {
    topicId?: string;
    topicIds?: string[];
    title?: string;
    content?: string;
    images?: File[] | FileList | null;
}