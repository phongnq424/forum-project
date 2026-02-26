import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { PaginatedPostResponse } from "$lib/types/post.type";

export const postService = {
    async listPosts(params: {
        page?: number;
        limit?: number;
        topic_id?: string;
        user_id?: string;
        category_id?: string;
        sortBy?: string;
    }): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(ENDPOINTS.POSTS.BASE, { params });
    },

    async getByUser(userId: string, params: { page?: number; limit?: number }): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(`${ENDPOINTS.POSTS.BASE}/user/${userId}`, { params });
    },

    async getPost(id: string) {
        return api.get(`${ENDPOINTS.POSTS.BASE}/${id}`);
    },

    async createPost(formData: FormData) {
        // api.post tự nhận biết FormData để không set Content-Type: json
        return api.post(ENDPOINTS.POSTS.BASE, formData);
    },

    async updatePost(id: string, formData: FormData) {
        return api.put(`${ENDPOINTS.POSTS.BASE}/${id}`, formData);
    },

    async search(q: string) {
        // Chuyển về dạng params cho đồng bộ với cách xử lý của api.ts
        return api.get(`${ENDPOINTS.POSTS.BASE}/search`, { params: { q } });
    },

    async deletePost(id: string) {
        return api.delete(`${ENDPOINTS.POSTS.BASE}/${id}`);
    }
};