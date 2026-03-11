import { api } from "./api";
import { ENDPOINTS } from "$lib/constants";
import type { PaginatedChallengeResponse, Challenge, ChallengePayload } from "$lib/types/challenge.type";

export const challengeService = {
    async listChallenges(params: {
        page?: number;
        limit?: number;
        type?: string;
        sortBy?: string;
        q?: string;
    }): Promise<PaginatedChallengeResponse> {
        return api.get<PaginatedChallengeResponse>(ENDPOINTS.CHALLENGE.BASE, { params });
    },

    async getById(id: string) {
        return api.get<Challenge>(ENDPOINTS.CHALLENGE.BY_ID(id))
    },

    async createChallenge(data: ChallengePayload) {
        return api.post(ENDPOINTS.CHALLENGE.BASE, data)
    },

    async updateChallenge(id: string, data: ChallengePayload) {
        return api.put(ENDPOINTS.CHALLENGE.BY_ID(id), data)
    }

}