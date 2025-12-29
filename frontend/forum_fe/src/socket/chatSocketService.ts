import { socket } from "./index";

const chatSocketService = {
  /* ================= EMIT ================= */

  joinChat: (chatId: string) => {
    socket.emit("joinChat", chatId);
  },

  leaveChat: (chatId: string) => {
    socket.emit("leaveChat", chatId);
  },

  /* ================= ON - LISTEN ================= */

  onNewChat: (cb: (...args: any[]) => void) => socket.on("chat:new", cb),

  onNewMessage: (cb: (...args: any[]) => void) =>
    socket.on("chat:message:new", cb),
  onChatRead: (cb: (...args: any[]) => void) => socket.on("chat:read", cb),
  onChatLeft: (cb: (...args: any[]) => void) => socket.on("chat:left", cb),

  /* ================= OFF ================= */

  offNewChat: (cb: (...args: any[]) => void) => socket.off("chat:new", cb),
  offNewMessage: (cb: (...args: any[]) => void) =>
    socket.off("chat:message:new", cb),
  offChatRead: (cb: (...args: any[]) => void) => socket.off("chat:read", cb),
  offChatLeft: (cb: (...args: any[]) => void) => socket.off("chat:left", cb),
};

export default chatSocketService;
