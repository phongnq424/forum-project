export interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Post {
    id: string;
    user_id: string;
    topic_id: string;
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

    User: {
        id: string;
        username: string;
        fullname?: string; // Đặt dấu ? (optional) đề phòng BE lúc có lúc không
        avatar: string | null;
    };

    Topic: {
        id: string;
        name: string;
    };

    Image: {
        id: string;
        url: string;
    }[];

    permissions: {
        canEdit: boolean;
        canDelete: boolean;
    };
}

export interface PaginatedPostResponse {
    data: Post[];
    pagination: PaginationMetadata;
}

export interface PostCreatePayload {
    topic_id: string;
    title: string;
    content: string;
    images?: File[] | FileList | null;
}

export interface PostUpdatePayload {
    topic_id?: string;
    title?: string;
    content?: string;
    images?: File[] | FileList | null;
}