import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  MessageSquare,
  UserPlus,
  Star,
  Package,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import {
  useGetNotifications,
  useGetUnreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useOffListenNewNotification,
  useOffListenUnreadBadge,
  useOnListenNewNotification,
  useOnListenUnreadBadge,
} from "@/api/hooks/notificationHook";

import LoadingScreen from "../pages/LoadingScreen.jsx";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  ref: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const markAsRead = (id: string) => {
    markRead.mutate({ id });
  };

  const nav = useNavigate();

  const markAllAsRead = () => {
    markAllRead.mutate();
  };

  const onListenNewNotification = useOnListenNewNotification();
  const offListenNewNotification = useOffListenNewNotification();

  const onUnread = useOnListenUnreadBadge();
  const offUnread = useOffListenUnreadBadge();

  const handleOnHaveNewNotification = function (notification: any) {
    const valid = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.message,
      time: new Date(notification.created_at).toLocaleString(),
      read: notification.is_read,
      ref: notification.ref_id,
    };

    setNotifications((prev) => [valid, ...prev]);
  };

  const handleOnUnread = function (unread: any) {
    console.log(unread.unreadCount);
    setUnreadCount(unread.unreadCount);
  };

  useEffect(() => {
    onListenNewNotification.mutate({
      onNewNotification: handleOnHaveNewNotification,
    });

    onUnread.mutate({
      onUnread: handleOnUnread,
    });

    return () => {
      offListenNewNotification.mutate({
        offNewNotification: handleOnHaveNewNotification,
      });

      offUnread.mutate({
        onUnread: handleOnUnread,
      });
    };
  }, []);

  const getUnreadCount = useGetUnreadCount();
  useEffect(
    function () {
      if (getUnreadCount.isSuccess) {
        setUnreadCount((getUnreadCount.data as any)?.unreadCount ?? 0);
      }
    },
    [getUnreadCount.data, getUnreadCount.isSuccess, getUnreadCount.isError]
  );

  const getNotifications = useGetNotifications({}, true);
  useEffect(
    function () {
      if (getNotifications.isSuccess && getNotifications.data) {
        // const valid = (getNotifications.data?.data as any[]).map();

        const valid = getNotifications.data.data.map(function (
          it: any,
          i: number
        ): Notification {
          return {
            id: it.id,
            type: it.type,
            title: it.title,
            description: it.message,
            time: new Date(it.created_at).toLocaleString(),
            read: it.is_read,
            ref: it.ref_id,
          };
        });

        setNotifications(valid);
      }
    },
    [
      getNotifications.data,
      getNotifications.isSuccess,
      getNotifications.isError,
    ]
  );

  useEffect(
    function () {
      console.log("THUAN", notifications);
    },
    [notifications]
  );

  if (getUnreadCount.isLoading || getNotifications.isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative p-2.5 rounded-full transition-all duration-200",
            "bg-secondary hover:bg-secondary/80",
            "focus:outline-none hover:bg-proPurple",
            isOpen && "bg-secondary/80 shadow-glow",
            "aspect-square self-center h-[80%]",
            "bg-transparent flex justify-center items-center",
            "relative"
          )}
          aria-label={`Notifications${
            unreadCount > 0 ? `, ${unreadCount} unread` : ""
          }`}
        >
          <Bell className="h-6 w-6 text-foreground/80" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <div className="absolute inline-flex h-full w-full rounded-full bg-red-500 notification-badge-pulse" />
              <div className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-notification-badge text-[10px] font-semibold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-0 shadow-lg border-border/50 animate-in-scale bg-black404040 border-none"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-medium text-white hover:text-proPurple transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {notifications.map((notification) => {
                return (
                  <li
                    key={notification.id}
                    className={cn(
                      "relative flex gap-3 px-4 py-3 transition-colors cursor-pointer",
                      "hover:bg-white/10",
                      !notification.read && "font-bold"
                    )}
                    onClick={() => {
                      if (
                        notification.type.includes("COMMENT") ||
                        notification.type.includes("POST")
                      ) {
                        nav(`/post-detail?postId=${notification.ref}`);
                      }

                      if (notification.type.includes("FOLLOW")) {
                        nav(`/profile?id=${notification.ref}`);
                      }
                      markAsRead(notification.id);
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !notification.read
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/90"
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-proPurple" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 text-xs text-muted-foreground line-clamp-1",
                          !notification.read && "text-white"
                        )}
                      >
                        {notification.description}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {notification.time}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t border-border/50 px-4 py-2.5">
          <button className="w-full text-center text-sm font-medium text-white hover:text-proPurple transition-colors py-1 outline:none focus:ring-0">
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
