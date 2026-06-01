import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type { PaginatedPostResponse, Post } from "$lib/types/post.type";

export const postService = {
    async listPosts(
        params: {
            page?: number;
            limit?: number;
            topic_id?: string;
            topicId?: string;
            user_id?: string;
            category_id?: string;
            sortBy?: string;
            q?: string;
        },
        customFetch?: typeof fetch,
    ): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(ENDPOINTS.POSTS.BASE, {
            params,
            fetch: customFetch,
        });
    },

    async getByUser(
        userId: string,
        params: {
            page?: number;
            limit?: number;
        },
    ): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(
            `${ENDPOINTS.POSTS.BASE}/user/${userId}`,
            { params },
        );
    },

    async getPost(id: string, customFetch?: typeof fetch): Promise<Post> {
        return api.get<Post>(`${ENDPOINTS.POSTS.BASE}/${id}`, {
            fetch: customFetch,
        });
    },

    async createPost(formData: FormData): Promise<Post> {
        return api.post<Post>(ENDPOINTS.POSTS.BASE, formData);
    },

    async updatePost(id: string, formData: FormData): Promise<Post> {
        return api.put<Post>(`${ENDPOINTS.POSTS.BASE}/${id}`, formData);
    },

    async deletePost(id: string): Promise<{ message?: string }> {
        return api.delete<{ message?: string }>(
            `${ENDPOINTS.POSTS.BASE}/${id}`,
        );
    },
};