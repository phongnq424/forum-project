// $lib/types/challenge.ts
export type ChallengeDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ChallengeType = 'DSA' | 'SQL' | 'BACKEND';

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
    tags?: string[];
    isSolved?: boolean;
    totalSubmissions?: number;
    userStats?: UserStats | null;
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
    constraint: string;
    time_limit: number;
    memory_limit: number;
    point: number;
    difficulty: ChallengeDifficulty;
    type: ChallengeType;
}