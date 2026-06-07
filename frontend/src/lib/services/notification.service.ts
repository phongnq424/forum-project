import { api } from "$lib/services/api";
import { ENDPOINTS } from "$lib/constants";
import type {
    NotificationActionResponse,
    NotificationListResponse,
    UnreadCountResponse,
} from "$lib/types/notification.type";

export const notificationService = {
    list(params: { page?: number; limit?: number; unread?: boolean } = {}) {
        return api.get<NotificationListResponse>(ENDPOINTS.NOTIFICATIONS.LIST, {
            params,
        });
    },

    unreadCount() {
        return api.get<UnreadCountResponse>(
            ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT,
        );
    },

    markRead(id: string) {
        return api.patch<NotificationActionResponse>(
            ENDPOINTS.NOTIFICATIONS.MARK_READ(id),
        );
    },

    markAllRead() {
        return api.patch<NotificationActionResponse>(
            ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
        );
    },
};