import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { CreateCommentRequest, Comment, CommentListResponse } from "$lib/types/comment.type";


export const commentService = {
    async createComment(data: CreateCommentRequest): Promise<Comment> {
        return api.post(ENDPOINTS.COMMENTS.BASE, data);
    },

    async getCommentsByPost(postId: string): Promise<CommentListResponse> {
        return api.get(ENDPOINTS.COMMENTS.BY_POST(postId));
    },

    async deleteComment(commentId: string): Promise<void> {
        return api.delete(ENDPOINTS.COMMENTS.BY_COMMENT(commentId));
    }
}