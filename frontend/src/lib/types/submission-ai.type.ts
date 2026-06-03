export interface SubmissionInsightTopic {
    topic_id?: string;
    name?: string;
    slug?: string;
    Topic?: {
        id?: string;
        name?: string;
        slug?: string;
    };
}

export interface SubmissionAIInsight {
    id?: string;
    submission_id?: string;
    summary?: string | null;
    mistake_type?: string | null;
    mistake_level?: string | null;
    explanation?: string | null;
    suggestion?: string | null;
    confidence?: number | null;
    topics?: SubmissionInsightTopic[];
}

export interface SubmissionInsightResponse {
    ready: boolean;
    message?: string;
    insight?: SubmissionAIInsight | null;
}

export interface LearningRecommendationItem {
    id?: string;
    target_type?: string;
    target_id?: string;
    reason?: string | null;
    rank?: number;
}

export interface LearningRecommendation {
    id?: string;
    user_id?: string;
    submission_id?: string;
    topic_id?: string | null;
    reason?: string | null;
    priority?: number;
    status?: string;
    Topic?: {
        id?: string;
        name?: string;
        slug?: string;
    };
    learningRecommendationItems?: LearningRecommendationItem[];
}