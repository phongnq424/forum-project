import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    ChatMessageApiItem,
    ConversationApiItem,
    CreateChatResponse,
    CreateGroupPayload,
} from "$lib/types/chat.type";

export const chatService = {
    async listChats(): Promise<ConversationApiItem[]> {
        return api.get<ConversationApiItem[]>(
            ENDPOINTS.CONVERSATIONS.CHAT.ME,
        );
    },

    async getMessages(conversationId: string): Promise<ChatMessageApiItem[]> {
        return api.get<ChatMessageApiItem[]>(
            `${ENDPOINTS.CONVERSATIONS.CHAT.BASE}/${conversationId}/messages`,
        );
    },

    async sendMessage(payload: {
        toUserId: string;
        content: string;
    }): Promise<ChatMessageApiItem> {
        return api.post<ChatMessageApiItem>(
            ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES,
            payload,
        );
    },

    async createChat(userId: string): Promise<CreateChatResponse> {
        return api.post<CreateChatResponse>(
            ENDPOINTS.CONVERSATIONS.CHAT.BASE,
            { userId },
        );
    },

    async createGroup(payload: CreateGroupPayload) {
        return api.post(
            ENDPOINTS.CONVERSATIONS.GROUP.BASE,
            payload,
        );
    },

    async listGroups(params?: {
        scope?: string;
        topic_id?: string;
        challenge_id?: string;
    }) {
        return api.get(
            ENDPOINTS.CONVERSATIONS.GROUP.BASE,
            { params },
        );
    },

    async leaveGroup(conversationId: string) {
        return api.delete(
            `${ENDPOINTS.CONVERSATIONS.GROUP.BASE}/${conversationId}/leave`,
        );
    },
};