export interface CreateCommentRequest {
    postId: string;
    comment_detail: string;
    parent_id?: string | null;
}

export interface CommentUser {
    id: string;
    username: string;
    avatar: string | null;
    fullname: string | null;
}

export interface CommentStats {
    total: number;
    count: number;
    average: number;
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    parentComment_id: string | null;

    comment_detail: string;

    created_at: string;
    updated_at: string;

    is_deleted: boolean;
    deleted_at: string | null;

    User: CommentUser;

    childComments: Comment[];

    stats: CommentStats;
}

export type CommentListResponse = Comment[];