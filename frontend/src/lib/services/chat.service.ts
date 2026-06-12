import { api } from "./api";
import { ENDPOINTS } from "$lib/constants/index";
import type {
    AttachmentUrlResponse,
    ChatMessageApiItem,
} from "$lib/types/chat-common.type";
import type {
    ConversationApiItem,
    CreateChatResponse,
    SendDirectMessagePayload,
} from "$lib/types/chat.type";
import type {
    AdminCreateGroupPayload,
    AdminCreateGeneralGroupPayload,
    AdminGroupApiItem,
    AdminUpdateGroupPayload,
    CreateGroupPayload,
    GroupListParams,
    PublicGroupApiItem,
    SendGroupMessagePayload,
} from "$lib/types/group.type";

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
            ENDPOINTS.CONVERSATIONS.CHAT.ME,
        );
    },

    async getMessages(conversationId: string): Promise<ChatMessageApiItem[]> {
        return api.get<ChatMessageApiItem[]>(
            `${ENDPOINTS.CONVERSATIONS.CHAT.BASE}/${conversationId}/messages`,
        );
    },

    async sendMessage(
        payload: SendDirectMessagePayload,
    ): Promise<ChatMessageApiItem> {
        const hasFiles = payload.files && payload.files.length > 0;

        if (hasFiles) {
            const formData = buildMessageFormData(
                payload.content,
                payload.files,
            );

            formData.append("toUserId", payload.toUserId);

            return api.post<ChatMessageApiItem>(
                ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES,
                formData,
            );
        }

        return api.post<ChatMessageApiItem>(
            ENDPOINTS.CONVERSATIONS.CHAT.MESSAGES,
            {
                toUserId: payload.toUserId,
                content: payload.content || "",
            },
        );
    },

    async sendGroupMessage(
        payload: SendGroupMessagePayload,
    ): Promise<ChatMessageApiItem> {
        const hasFiles = payload.files && payload.files.length > 0;
        const path = `${ENDPOINTS.CONVERSATIONS.GROUP.BASE}/${payload.conversationId}/message`;

        if (hasFiles) {
            const formData = buildMessageFormData(
                payload.content,
                payload.files,
            );

            return api.post<ChatMessageApiItem>(path, formData);
        }

        return api.post<ChatMessageApiItem>(path, {
            content: payload.content || "",
        });
    },

    async getAttachmentUrl(
        attachmentId: string,
    ): Promise<AttachmentUrlResponse> {
        return api.get<AttachmentUrlResponse>(
            `/conversations/attachments/${attachmentId}/url`,
        );
    },

    async createChat(userId: string): Promise<CreateChatResponse> {
        return api.post<CreateChatResponse>(
            ENDPOINTS.CONVERSATIONS.CHAT.BASE,
            { userId },
        );
    },

    async createGroup(payload: CreateGroupPayload) {
        return api.post(ENDPOINTS.CONVERSATIONS.GROUP.BASE, payload);
    },

    async listGroups(params?: {
        scope?: string, topic_id?: string; challenge_id?: string;
    }): Promise<PublicGroupApiItem[]> {
        return api.get<PublicGroupApiItem[]>(
            ENDPOINTS.CONVERSATIONS.GROUP.ME,
            { params },
        );
    },

    async leaveGroup(conversationId: string) {
        return api.post(
            ENDPOINTS.CONVERSATIONS.GROUP.LEAVE(conversationId),
        );
    },

    async listPublicGroups(
        params?: GroupListParams,
    ): Promise<PublicGroupApiItem[]> {
        return api.get<PublicGroupApiItem[]>(
            ENDPOINTS.CONVERSATIONS.GROUP.PUBLIC,
            {
                params,
            },
        );
    },

    async joinGroup(conversationId: string): Promise<{
        conversationId: string;
        joined: boolean;
    }> {
        return api.post<{
            conversationId: string;
            joined: boolean;
        }>(ENDPOINTS.CONVERSATIONS.GROUP.JOIN(conversationId));
    },

    async adminListGroups(
        params?: GroupListParams,
    ): Promise<AdminGroupApiItem[]> {
        return api.get<AdminGroupApiItem[]>(
            ENDPOINTS.CONVERSATIONS.ADMIN_GROUPS.BASE,
            {
                params,
            },
        );
    },

    async adminCreateGroup(
        payload: AdminCreateGroupPayload,
    ): Promise<AdminGroupApiItem> {
        return api.post<AdminGroupApiItem>(
            ENDPOINTS.CONVERSATIONS.ADMIN_GROUPS.BASE,
            payload,
        );
    },

    async adminCreateGeneralGroup(
        payload: AdminCreateGeneralGroupPayload,
    ): Promise<AdminGroupApiItem> {
        return this.adminCreateGroup(payload);
    },

    async adminUpdateGroup(
        conversationId: string,
        payload: AdminUpdateGroupPayload,
    ): Promise<AdminGroupApiItem> {
        return api.put<AdminGroupApiItem>(
            `${ENDPOINTS.CONVERSATIONS.ADMIN_GROUPS.BASE}/${conversationId}`,
            payload,
        );
    },

    async adminDeleteGroup(conversationId: string): Promise<{ message: string }> {
        return api.delete<{ message: string }>(
            `${ENDPOINTS.CONVERSATIONS.ADMIN_GROUPS.BASE}/${conversationId}`,
        );
    },
};