// src/api/services/notificationService.ts
import axiosClient from "@/api/AxiosClient";

export interface Notification {
  id: string;
  title?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const notificationService = {
  list(params?: { page?: number; limit?: number; unread?: boolean }) {
    return axiosClient.get("/notifications", {
      params,
    });
  },

  unreadCount() {
    return axiosClient.get("/notifications/unread-count");
  },

  markRead(id: string) {
    return axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllRead() {
    return axiosClient.patch("/notifications/read-all");
  },
};

export default notificationService;
