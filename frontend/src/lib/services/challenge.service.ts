import { api } from "./api";
import { ENDPOINTS } from "$lib/constants";
import type {
    PaginatedChallengeResponse,
    Challenge,
    ChallengePayload
} from "$lib/types/challenge.type";
import type {
    ApiTestcase,
    ApiTestcasePayload,
} from "$lib/types/testcase.type";

export const challengeService = {
    async listChallenges(params: {
        page?: number;
        limit?: number;
        type?: string;
        sortBy?: string;
        q?: string;
    }): Promise<PaginatedChallengeResponse> {
        return api.get<PaginatedChallengeResponse>(
            ENDPOINTS.CHALLENGE.BASE,
            { params }
        );
    },

    async getById(id: string): Promise<Challenge> {
        return api.get<Challenge>(ENDPOINTS.CHALLENGE.BY_ID(id));
    },

    async createChallenge(data: ChallengePayload): Promise<Challenge> {
        return api.post<Challenge>(ENDPOINTS.CHALLENGE.BASE, data);
    },

    async updateChallenge(
        id: string,
        data: ChallengePayload
    ): Promise<Challenge> {
        return api.put<Challenge>(ENDPOINTS.CHALLENGE.BY_ID(id), data);
    },

    async deleteChallenge(id: string): Promise<{ count: number }> {
        return api.delete<{ count: number }>(ENDPOINTS.CHALLENGE.BY_ID(id));
    },
    async uploadTestcaseZip(
        challengeId: string,
        file: File
    ): Promise<unknown> {
        const formData = new FormData();
        formData.append("zipfile", file);

        return api.post(
            `testcases/${challengeId}/upload-zip`,
            formData
        );
    },

    async listTestcases(challengeId: string): Promise<ApiTestcase[]> {
        return api.get<ApiTestcase[]>(`testcases/${challengeId}`);
    },

    async createApiTestcase(
        challengeId: string,
        data: ApiTestcasePayload
    ): Promise<ApiTestcase> {
        return api.post<ApiTestcase>(
            `testcases/${challengeId}/api`,
            data
        );
    },

    async updateTestcase(
        testcaseId: string,
        data: Partial<ApiTestcasePayload>
    ): Promise<ApiTestcase> {
        return api.put<ApiTestcase>(
            `testcases/${testcaseId}`,
            data
        );
    },

    async deleteTestcase(testcaseId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(
            `testcases/${testcaseId}`
        );
    },
};