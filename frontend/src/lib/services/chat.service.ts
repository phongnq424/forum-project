import { api } from './api';
import { ENDPOINTS } from '$lib/constants/index';

export const chatService = {
    async listChats() {
        return api.get(ENDPOINTS.CONVERSATIONS.CHAT.ME);
    },

    async getMessages(conversationId: string) {
        return api.get(
            `${ENDPOINTS.CONVERSATIONS.CHAT.BASE}/${conversationId}/messages`);
    },

    async sendMessage(payload: { toUserId: string; content: string }) {
        return api.post(ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES, payload);
    },

    async createChat(userId: string) {
        return api.post(ENDPOINTS.CONVERSATIONS.CHAT.BASE, { userId });
    }
};