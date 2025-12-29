import tokenHelper from "@/helper/TokenHelper";
import { io, Socket } from "socket.io-client";

const serverUrl =
  (import.meta as any).env?.SERVER_BARE_URL || "http://localhost:3000";

export const socket: Socket = io(serverUrl, {
  autoConnect: false,
  auth: {
    token: tokenHelper.getToken() || "",
  },
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
