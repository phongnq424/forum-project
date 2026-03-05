import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';
import type { PaginatedPostResponse } from "$lib/types/post.type";

export const postSaveService = {

    async getSavedPosts(
        params: {
            page?: number;
            limit?: number;
            q?: string;
        },
        customFetch?: typeof fetch
    ): Promise<PaginatedPostResponse> {
        return api.get<PaginatedPostResponse>(ENDPOINTS.POSTS.SAVED, {
            params,
            fetch: customFetch
        });
    },

    async toggleSave(postId: string | number) {
        return api.post<{ saved: boolean; postSaved?: any }>(
            `${ENDPOINTS.POSTS.SAVED}/toggle/${postId}`
        );
    }
};