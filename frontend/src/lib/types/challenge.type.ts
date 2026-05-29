export type ChallengeDifficulty = "EASY" | "MEDIUM" | "HARD";
export type ChallengeType = "DSA" | "SQL" | "BACKEND" | "CONTEST";

export interface ChallengeTopic {
    id: string;
    name: string;
    slug?: string;
}

export interface ChallengeTopicPivot {
    topic_id: string;
    weight?: number;
    Topic?: ChallengeTopic;
}

export interface UserStats {
    highestScore: number;
    totalSubmissions: number;
}

export interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface Challenge {
    id: string;
    title: string;
    description?: string;
    input: string;
    output: string;
    constraints: string;
    time_limit: number;
    memory_limit: number;
    difficulty: ChallengeDifficulty;
    type: ChallengeType;
    point?: number;

    topics?: ChallengeTopic[];
    challengeTopics?: ChallengeTopicPivot[];

    isSolved?: boolean;
    totalSubmissions?: number;
    userStats?: UserStats | null;
    created_at: string;
}

export interface PaginatedChallengeResponse {
    data: Challenge[];
    pagination: PaginationMetadata;
}

export interface ChallengePayload {
    title: string;
    description?: string;
    input: string;
    output: string;
    constraints: string;
    time_limit: number;
    memory_limit: number;
    point: number;
    difficulty: ChallengeDifficulty;
    type: ChallengeType;

    topicIds?: string[];
    topics?: {
        topic_id: string;
        weight?: number;
    }[];
}