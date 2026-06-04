import type { Pagination } from "./common.type";
import type { Post } from "./post.type";

export interface RecommendationTopic {
    id: string;
    name: string;
    slug?: string;
}

export interface RecommendationTopicProfileItem {
    topicId: string;
    score: number;
    sources: string[];
    topic: RecommendationTopic | null;
}

export interface RecommendedPost extends Post {
    recommendationScore?: number;
    recommendationReason?: string;
    recommendationSources?: string[];
    recommendationMatched?: boolean;
}

export interface PaginatedRecommendedPostResponse {
    data: RecommendedPost[];
    pagination: Pagination;
    meta?: {
        topicProfile?: RecommendationTopicProfileItem[];
        matchedCount?: number;
        fallbackCount?: number;
    };
}