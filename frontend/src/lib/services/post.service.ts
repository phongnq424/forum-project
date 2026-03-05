import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { PaginatedPostResponse, Post } from "$lib/types/post.type";

export const postService = {
    async listPosts(params: {
        page?: number;
        limit?: number;
        topic_id?: string;
        user_id?: string;
        category_id?: string;
        sortBy?: string;
        q?: string;
    }, customFetch?: typeof fetch): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(ENDPOINTS.POSTS.BASE, { params, fetch: customFetch });
    },

    async getByUser(userId: string, params: { page?: number; limit?: number }): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(`${ENDPOINTS.POSTS.BASE}/user/${userId}`, { params });
    },

    async getPost(id: string, customFetch?: typeof fetch): Promise<Post> {
        return api.get(`${ENDPOINTS.POSTS.BASE}/${id}`, { fetch: customFetch });
    },

    async createPost(formData: FormData) {
        return api.post(ENDPOINTS.POSTS.BASE, formData);
    },

    async updatePost(id: string, formData: FormData) {
        return api.put(`${ENDPOINTS.POSTS.BASE}/${id}`, formData);
    },

    async deletePost(id: string) {
        return api.delete(`${ENDPOINTS.POSTS.BASE}/${id}`);
    }
};