import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    InterestedTopic,
    InterestedTopicFollowPayload,
} from "$lib/types/interested-topic.type";

export const interestedTopicService = {
    getMyTopics(customFetch?: typeof fetch): Promise<InterestedTopic[]> {
        return api.get(ENDPOINTS.INTERESTED_TOPICS.ME, {
            fetch: customFetch,
        });
    },

    follow(payload: InterestedTopicFollowPayload): Promise<InterestedTopic> {
        return api.post(ENDPOINTS.INTERESTED_TOPICS.BASE, payload);
    },

    unfollow(topicId: string): Promise<{ count?: number }> {
        return api.delete(ENDPOINTS.INTERESTED_TOPICS.BY_TOPIC_ID(topicId));
    },
};