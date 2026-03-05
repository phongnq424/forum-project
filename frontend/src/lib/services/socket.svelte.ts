// src/lib/services/socket.svelte.ts
import { io, Socket } from "socket.io-client";
import { authState } from "$lib/states/auth.svelte";

class SocketService {
    socket = $state<Socket | null>(null);
    isConnected = $state(false);
    typingStatus = $state<Record<string, boolean>>({});

    connect() {
        if (this.socket?.connected) return;
        this.socket = io("http://localhost:3000", {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => (this.isConnected = true));
        this.socket.on("disconnect", () => (this.isConnected = false));

        this.socket.on("user_typing", ({ userId, isTyping }) => {
            this.typingStatus[userId] = isTyping;
        });
    }

    joinRoom(conversationId: string) {
        // Cần đảm bảo Backend có xử lý sự kiện 'join_room' trong file chat.handler.js
        this.socket?.emit("join_room", conversationId);
    }

    leaveRoom(conversationId: string) {
        this.socket?.emit("leave_room", conversationId);
    }

    sendTyping(conversationId: string, isTyping: boolean) {
        this.socket?.emit("typing", { conversationId, isTyping });
    }

    emit(event: string, data: any) {
        this.socket?.emit(event, data);
    }

    on(event: string, callback: (data: any) => void) {
        this.socket?.on(event, callback);
        return () => this.socket?.off(event, callback);
    }
}

export const socketService = new SocketService();