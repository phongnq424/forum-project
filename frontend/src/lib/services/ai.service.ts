import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';

export const AiService = {
    async getHistory() {
        return api.get(ENDPOINTS.AI.HISTORY);
    },

    async sendMessage(payload: { content: string }): Promise<{ content: string }> {
        return api.post(ENDPOINTS.AI.CHAT, payload);
    },
};