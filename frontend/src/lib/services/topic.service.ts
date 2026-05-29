import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    DeleteManyResponse,
    TopicCreatePayload,
    TopicListParams,
    TopicListResponse,
    TopicUpdatePayload,
} from "$lib/types/topic.type";

export const adminTopicService = {
    listTopics(params?: TopicListParams): Promise<TopicListResponse> {
        return api.get(ENDPOINTS.TOPICS.BASE, { params });
    },

    createTopic(payload: TopicCreatePayload): Promise<{ count: number }> {
        return api.post(ENDPOINTS.TOPICS.BASE, [payload]);
    },

    createTopics(payload: TopicCreatePayload[]): Promise<{ count: number }> {
        return api.post(ENDPOINTS.TOPICS.BASE, payload);
    },

    updateTopic(id: string, payload: TopicUpdatePayload): Promise<unknown> {
        return api.put(ENDPOINTS.TOPICS.BY_ID(id), payload);
    },

    deleteTopics(ids: string[]): Promise<DeleteManyResponse> {
        return api.delete(ENDPOINTS.TOPICS.BASE, { ids });
    },

    deleteTopic(id: string): Promise<DeleteManyResponse> {
        return api.delete(ENDPOINTS.TOPICS.BASE, { ids: [id] });
    },
};