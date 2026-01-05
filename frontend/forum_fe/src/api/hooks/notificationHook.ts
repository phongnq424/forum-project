// src/api/queries/useNotifications.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import notificationService from "@/api/services/notificationService";
import notificationSocketService from "@/socket/notificationSocketService";

/* ================= LIST ================= */

export const useGetNotifications = (
  params?: {
    page?: number;
    limit?: number;
    unread?: boolean;
  },
  enabled: boolean = false
) =>
  useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.list(params),
    enabled: enabled,
  });

/* ================= UNREAD COUNT ================= */

export const useGetUnreadCount = () =>
  useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationService.unreadCount(),
  });

/* ================= MUTATIONS ================= */

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      });
    },
  });
};

export const useOnListenNewNotification = function () {
  return useMutation({
    mutationFn: function ({
      onNewNotification,
    }: {
      onNewNotification: (...args: any[]) => void;
    }) {
      return Promise.resolve(
        notificationSocketService.onNewNotification(onNewNotification)
      );
    },
  });
};

export const useOffListenNewNotification = function () {
  return useMutation({
    mutationFn: function ({
      offNewNotification,
    }: {
      offNewNotification: (...args: any[]) => void;
    }) {
      return Promise.resolve(
        notificationSocketService.offNewNotification(offNewNotification)
      );
    },
  });
};

export const useOnListenUnreadBadge = function () {
  return useMutation({
    mutationFn: function ({
      onUnread,
    }: {
      onUnread: (...args: any[]) => void;
    }) {
      return Promise.resolve(notificationSocketService.onUnreadBadge(onUnread));
    },
  });
};

export const useOffListenUnreadBadge = function () {
  return useMutation({
    mutationFn: function ({
      onUnread,
    }: {
      onUnread: (...args: any[]) => void;
    }) {
      return Promise.resolve(
        notificationSocketService.offUnreadBadge(onUnread)
      );
    },
  });
};
