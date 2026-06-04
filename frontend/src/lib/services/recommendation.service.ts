import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type { PaginatedRecommendedPostResponse } from "$lib/types/recommendation.type";

export const recommendationService = {
    getRecommendedPosts(
        params?: {
            page?: number;
            limit?: number;
        },
        customFetch?: typeof fetch,
    ): Promise<PaginatedRecommendedPostResponse> {
        return api.get(ENDPOINTS.RECOMMENDATIONS.POSTS, {
            params,
            fetch: customFetch,
        });
    },
};