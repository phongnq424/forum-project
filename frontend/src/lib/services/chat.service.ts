import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    AttachmentUrlResponse,
    ChatMessageApiItem,
    ConversationApiItem,
    CreateChatResponse,
    CreateGroupPayload,
    SendDirectMessagePayload,
    SendGroupMessagePayload
} from "$lib/types/chat.type";

function buildMessageFormData(content?: string, files?: File[]) {
    const formData = new FormData();

    if (content && content.trim() !== "") {
        formData.append("content", content);
    }

    if (files && files.length > 0) {
        for (const file of files) {
            formData.append("files", file);
        }
    }

    return formData;
}

export const chatService = {
    async listChats(): Promise<ConversationApiItem[]> {
        return api.get<ConversationApiItem[]>(
            ENDPOINTS.CONVERSATIONS.CHAT.ME
        );
    },

    async getMessages(conversationId: string): Promise<ChatMessageApiItem[]> {
        return api.get<ChatMessageApiItem[]>(
            `${ENDPOINTS.CONVERSATIONS.CHAT.BASE}/${conversationId}/messages`
        );
    },

    async sendMessage(payload: SendDirectMessagePayload): Promise<ChatMessageApiItem> {
        const hasFiles = payload.files && payload.files.length > 0;

        if (hasFiles) {
            const formData = buildMessageFormData(payload.content, payload.files);
            formData.append("toUserId", payload.toUserId);

            return api.post<ChatMessageApiItem>(
                ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES,
                formData
            );
        }

        return api.post<ChatMessageApiItem>(
            ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES,
            {
                toUserId: payload.toUserId,
                content: payload.content || ""
            }
        );
    },

    async sendGroupMessage(payload: SendGroupMessagePayload): Promise<ChatMessageApiItem> {
        const hasFiles = payload.files && payload.files.length > 0;
        const path = `${ENDPOINTS.CONVERSATIONS.GROUP.BASE}/${payload.conversationId}/message`;

        if (hasFiles) {
            const formData = buildMessageFormData(payload.content, payload.files);

            return api.post<ChatMessageApiItem>(
                path,
                formData
            );
        }

        return api.post<ChatMessageApiItem>(
            path,
            {
                content: payload.content || ""
            }
        );
    },

    async getAttachmentUrl(attachmentId: string): Promise<AttachmentUrlResponse> {
        return api.get<AttachmentUrlResponse>(
            `/attachments/${attachmentId}/url`
        );
    },

    async createChat(userId: string): Promise<CreateChatResponse> {
        return api.post<CreateChatResponse>(
            ENDPOINTS.CONVERSATIONS.CHAT.BASE,
            { userId }
        );
    },

    async createGroup(payload: CreateGroupPayload) {
        return api.post(
            ENDPOINTS.CONVERSATIONS.GROUP.BASE,
            payload
        );
    },

    async listGroups(params?: {
        scope?: string;
        topic_id?: string;
        challenge_id?: string;
    }) {
        return api.get(
            ENDPOINTS.CONVERSATIONS.GROUP.BASE,
            { params }
        );
    },

    async leaveGroup(conversationId: string) {
        return api.post(
            `${ENDPOINTS.CONVERSATIONS.GROUP.BASE}/${conversationId}/leave`
        );
    }
};