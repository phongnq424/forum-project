import { api } from "./api";
import type {
    CallApiItem,
    CallFinishResponse,
    StartCallPayload,
} from "$lib/types/call.type";

const BASE = "/calls";

export const callService = {
    async startCall(payload: StartCallPayload): Promise<CallApiItem> {
        return api.post<CallApiItem>(BASE, payload);
    },

    async listCalls(conversationId?: string): Promise<CallApiItem[]> {
        return api.get<CallApiItem[]>(BASE, {
            params: conversationId ? { conversationId } : undefined,
        });
    },

    async getCall(callId: string): Promise<CallApiItem> {
        return api.get<CallApiItem>(`${BASE}/${callId}`);
    },

    async answerCall(callId: string): Promise<CallApiItem> {
        return api.patch<CallApiItem>(`${BASE}/${callId}/answer`);
    },

    async rejectCall(callId: string): Promise<CallFinishResponse> {
        return api.patch<CallFinishResponse>(`${BASE}/${callId}/reject`);
    },

    async cancelCall(callId: string): Promise<CallFinishResponse> {
        return api.patch<CallFinishResponse>(`${BASE}/${callId}/cancel`);
    },

    async endCall(callId: string): Promise<CallFinishResponse> {
        return api.patch<CallFinishResponse>(`${BASE}/${callId}/end`);
    },

    async markMissedCall(callId: string): Promise<CallFinishResponse> {
        return api.patch<CallFinishResponse>(`${BASE}/${callId}/missed`);
    },
};