export interface InterestedTopicCategory {
    id: string;
    name: string;
}

export interface InterestedTopicTopic {
    id: string;
    name: string;
    description?: string | null;
    Category?: InterestedTopicCategory | null;
}

export interface InterestedTopic {
    user_id: string;
    topic_id: string;
    Topic: InterestedTopicTopic;
}

export interface InterestedTopicFollowPayload {
    topic_id: string;
}