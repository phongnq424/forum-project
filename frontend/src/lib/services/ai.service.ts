import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';

export type AiSuggestionCard = {
    id: string;
    type: "POST" | "CHALLENGE";
    title: string;
    description?: string;
    meta?: string;
    url: string;
};

export type AiChatRequest = {
    message: string;
    lastCards?: AiSuggestionCard[];
};

export type AiChatResponse = {
    reply: string;
    cards?: AiSuggestionCard[];
};

export const AiService = {
    async getHistory() {
        return api.get(ENDPOINTS.AI.HISTORY);
    },

    async sendMessage(data: AiChatRequest): Promise<AiChatResponse> {
        return api.post(ENDPOINTS.AI.CHAT, data);
    },
};