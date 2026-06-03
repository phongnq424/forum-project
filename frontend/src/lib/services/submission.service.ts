import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    SubmissionListResponse,
    SubmissionDetail,
    SubmitPayload,
    SubmitResponse
} from "$lib/types/submission.type";
import type { Leaderboard } from "$lib/types/leaderboard.type";
import type {
    LearningRecommendation,
    SubmissionInsightResponse,
} from "$lib/types/submission-ai.type";

export const submissionService = {

    submit(payload: SubmitPayload): Promise<SubmitResponse> {
        return api.post(ENDPOINTS.SUBMISSIONS.BASE, payload);
    },

    getSubmission(id: string, customFetch?: typeof fetch): Promise<SubmissionDetail> {
        return api.get(ENDPOINTS.SUBMISSIONS.BY_ID(id), { fetch: customFetch });
    },

    listByChallenge(challengeId: string, customFetch?: typeof fetch
    ): Promise<SubmissionListResponse> {
        return api.get(ENDPOINTS.SUBMISSIONS.BY_CHALLENGE(challengeId), { fetch: customFetch });
    },

    listByUser(userId: string, customFetch?: typeof fetch
    ): Promise<SubmissionListResponse> {
        return api.get(ENDPOINTS.SUBMISSIONS.BY_USER(userId), { fetch: customFetch });
    },

    listByUserAndChallenge(
        userId: string,
        challengeId: string,
        customFetch?: typeof fetch
    ): Promise<SubmissionListResponse> {
        return api.get(
            ENDPOINTS.SUBMISSIONS.BY_USER_AND_CHALLENGE(userId, challengeId),
            { fetch: customFetch }
        );
    },

    getLeaderboard(challengeId: string,
        customFetch?: typeof fetch): Promise<Leaderboard[]> {
        return api.get(
            ENDPOINTS.LEADERBOARD.BY_CHALLENGE(challengeId),
            { fetch: customFetch }
        );
    },

    async getInsight(id: string): Promise<SubmissionInsightResponse> {
        return api.get(ENDPOINTS.SUBMISSIONS.INSIGHT(id));
    },

    async getRecommendations(id: string): Promise<LearningRecommendation[]> {
        return api.get(ENDPOINTS.SUBMISSIONS.RECOMMENDATIONS(id));
    },
};