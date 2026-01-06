import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Bell } from "lucide-react";
import type { Notification } from "./bellNotification";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useGetNotifications } from "@/api/hooks/notificationHook";
import PaginationInput from "../PaginationInput";

type NotificationDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initNotifications: Notification[];
};

export default function NotificationDialog({
  open,
  setOpen,
  initNotifications,
}: NotificationDialogProps) {
  const nav = useNavigate();
  const [notifications, setNotifications] = useState(initNotifications);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const getNotifications = useGetNotifications({ page: page }, true);
  useEffect(
    function () {
      if (getNotifications.isSuccess && getNotifications.data) {
        // const valid = (getNotifications.data?.data as any[]).map();
        const total = getNotifications.data?.pagination?.totalPages;
        setTotalPages(total);
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
      getNotifications.isError,
      getNotifications.isSuccess,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          sm:max-w-md
          bg-[#404040]
          text-white
          border-0
          shadow-none
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Notifications</DialogTitle>
        </DialogHeader>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications?.length === 0 ? (
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
                      setOpen(false);
                      if (
                        notification.type.includes("COMMENT") ||
                        notification.type.includes("POST")
                      ) {
                        nav(`/post-detail?postId=${notification.ref}`);
                      }

                      if (notification.type.includes("FOLLOW")) {
                        nav(`/profile?id=${notification.ref}`);
                      }
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

        <PaginationInput
          totalPages={totalPages}
          onChange={(p: number) => setPage(p)}
          currentPage={1}
        />
      </DialogContent>
    </Dialog>
  );
}
