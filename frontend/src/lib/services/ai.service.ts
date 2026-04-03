import { api } from '$lib/services/api';
import { ENDPOINTS } from '$lib/constants';

export const AiService = {
    async getHistory() {
        return api.get(ENDPOINTS.AI.HISTORY);
    },

    async sendMessage(payload: { message: string }): Promise<{ reply: string }> {
        return api.post(ENDPOINTS.AI.CHAT, payload);
    },
};