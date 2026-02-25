export interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Post {
    id: string;
    title: string;
    content?: string;
    created_at: string;
    updated_at: string;
    userId: string;
    commentCount: number;
    User: {
        username: string;
        fullname: string;
        avatar: string | null;
    };
}

export interface PaginatedPostResponse {
    data: Post[];
    pagination: PaginationMetadata;
}