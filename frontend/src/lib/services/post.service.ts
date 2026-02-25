import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { PaginatedPostResponse } from "$lib/types/post.type";

export const postService = {
    async createPost(formData: FormData) {
        const response = await api.post(ENDPOINTS.POSTS.BASE, formData);
        return response.data;
    },

    async listPosts(params: { page?: number; limit?: number; topic_id?: string; user_id?: string; category_id?: string }): Promise<PaginatedPostResponse> {
        const query = new URLSearchParams(params as any).toString();
        const response = await api.get(`${ENDPOINTS.POSTS.BASE}?${query}`);
        return response.data; // Phải return .data để khớp với Type
    },

    async getByUser(userId: string, params: { page?: number; limit?: number }): Promise<PaginatedPostResponse> {
        const query = new URLSearchParams(params as any).toString();
        const response = await api.get(`${ENDPOINTS.POSTS.BASE}/user/${userId}?${query}`);
        return response.data;
    },

    async getPost(id: string) {
        const response = await api.get(`${ENDPOINTS.POSTS.BASE}/${id}`);
        return response.data;
    },

    async updatePost(id: string, formData: FormData) {
        const response = await api.put(`${ENDPOINTS.POSTS.BASE}/${id}`, formData);
        return response.data;
    },

    async search(q: string) {
        const response = await api.get(`${ENDPOINTS.POSTS.BASE}/search?q=${encodeURIComponent(q)}`);
        return response.data;
    }
};