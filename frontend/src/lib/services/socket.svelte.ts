// src/lib/services/socket.svelte.ts
import { io, Socket } from "socket.io-client";
import { authState } from "$lib/states/auth.svelte";
import { api } from "./api";

class SocketService {
    socket = $state<Socket | null>(null);
    isConnected = $state(false);
    typingStatus = $state<Record<string, boolean>>({});
    onlineUsers = $state<Record<string, boolean>>({});

    private pingInterval: any = null;

    connect() {
        if (this.socket?.connected) return;

        this.socket = io("http://localhost:3000", {
            withCredentials: true,
            transports: ["websocket", "polling"],
        });

        this.socket.on("connect", () => {
            this.isConnected = true;
            console.log("Tui vào nhà rồi nè");
            // start ping
            if (!this.pingInterval) {
                this.pingInterval = setInterval(() => {
                    this.socket?.emit("online:ping");
                }, 30000);
            }
        });
        this.socket.on("connect_error", async (err) => {
            if (err.message === "Unauthorized") {
                try {
                    await api.post("auth/refresh");
                    this.socket?.connect();
                } catch {
                    authState.clearAuth();
                }
            }
        });

        this.socket.on("disconnect", () => {
            this.isConnected = false;
            console.log("Tui rời đi rồi nhen!");
            if (this.pingInterval) {
                clearInterval(this.pingInterval);
                this.pingInterval = null;
            }
        });

        this.socket.on("user_typing", ({ userId, isTyping }) => {
            this.typingStatus[userId] = isTyping;
        });

        this.socket.on("user:online", ({ userId }) => {
            this.onlineUsers[userId] = true;
        });

        this.socket.on("user:offline", ({ userId }) => {
            this.onlineUsers[userId] = false;
        });
    }

    joinRoom(conversationId: string) {
        this.socket?.emit("joinChat", conversationId);
    }

    leaveRoom(conversationId: string) {
        this.socket?.emit("leaveChat", conversationId);
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