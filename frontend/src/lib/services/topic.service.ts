import { api } from "./api";
import { ENDPOINTS } from "$lib/constants";
import { cacheService } from "./cache.service";
import type {
    TopicCreatePayload,
    TopicListParams,
    TopicListResponse,
    TopicUpdatePayload
} from "$lib/types/topic.type";

export const adminTopicService = {
    async listTopics(
        params?: TopicListParams,
        customFetch?: typeof fetch
    ): Promise<TopicListResponse> {
        const cacheKey = `admin_topics_${JSON.stringify(params ?? {})}`;
        const cached = cacheService.get<TopicListResponse>(cacheKey);
        if (cached) return cached;

        const data = await api.get<TopicListResponse>(
            ENDPOINTS.TOPICS.BASE,
            { params, fetch: customFetch }
        );

        cacheService.set(cacheKey, data, 60);
        return data;
    },

    async createTopic(
        payload: TopicCreatePayload
    ): Promise<{ count: number }> {
        const result = await api.post<{ count: number }>(
            ENDPOINTS.TOPICS.BASE,
            payload
        );

        cacheService.clear();
        return result;
    },

    async updateTopic(
        id: string,
        payload: TopicUpdatePayload
    ): Promise<{ count: number }> {
        const result = await api.put<{ count: number }>(
            ENDPOINTS.TOPICS.BY_ID(id),
            payload
        );

        cacheService.clear();
        return result;
    },

    async deleteTopic(id: string): Promise<{ count: number }> {
        const result = await api.delete<{ count: number }>(
            ENDPOINTS.TOPICS.BY_ID(id)
        );

        cacheService.clear();
        return result;
    }
};