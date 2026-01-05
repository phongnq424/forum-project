import { socket } from "./index";

const notificationSocketService = {
  /* ================= ON - LISTEN ================= */

  onUnreadBadge: (cb: (...args: any[]) => void) =>
    socket.on("notification:badge", cb),

  onNewNotification: (cb: (...args: any[]) => void) =>
    socket.on("notification:new", cb),
  onUnread: (cb: (...args: any[]) => void) =>
    socket.on("notification:read", cb),

  /* ================= OFF ================= */

  offUnreadBadge: (cb: (...args: any[]) => void) =>
    socket.off("notification:badge", cb),
  offNewNotification: (cb: (...args: any[]) => void) =>
    socket.off("notification:new", cb),
  offUnread: (cb: (...args: any[]) => void) =>
    socket.off("notification:read", cb),
};

export default notificationSocketService;
