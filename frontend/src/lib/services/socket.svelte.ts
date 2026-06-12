// src/lib/services/socket.svelte.ts
import { io, Socket } from "socket.io-client";
import { authState } from "$lib/states/auth.svelte";
import { api } from "./api";

type SocketCallback = (data: any) => void;

class SocketService {
    socket = $state<Socket | null>(null);
    isConnected = $state(false);
    typingStatus = $state<Record<string, boolean>>({});
    onlineUsers = $state<Record<string, boolean>>({});

    private pingInterval: ReturnType<typeof setInterval> | null = null;
    private listeners = new Map<string, Set<SocketCallback>>();
    private joinedRooms = new Set<string>();

    connect() {
        if (this.socket?.connected) return;

        if (!this.socket) {
            this.socket = io("http://localhost:3000", {
                withCredentials: true,
                transports: ["websocket", "polling"],
                autoConnect: false,
            });

            this.bindCoreEvents();
            this.bindStoredListeners();
        }

        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    private bindCoreEvents() {
        if (!this.socket) return;

        this.socket.on("connect", () => {
            this.isConnected = true;
            console.log("Tui vào nhà rồi nè");

            this.bindStoredListeners();
            this.rejoinRooms();

            if (!this.pingInterval) {
                this.pingInterval = setInterval(() => {
                    this.socket?.emit("online:ping");
                }, 30000);
            }
        });

        this.socket.on("connect_error", async (err) => {
            if (err.message === "Unauthorized" || err.message === "UNAUTHORIZED") {
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

    private bindStoredListeners() {
        if (!this.socket) return;

        this.listeners.forEach((callbacks, event) => {
            callbacks.forEach((callback) => {
                this.socket?.off(event, callback);
                this.socket?.on(event, callback);
            });
        });
    }

    private rejoinRooms() {
        if (!this.socket?.connected) return;

        this.joinedRooms.forEach((conversationId) => {
            this.socket?.emit("joinChat", conversationId);
        });
    }

    joinRoom(conversationId: string) {
        if (!conversationId) return;

        this.joinedRooms.add(conversationId);

        if (this.socket?.connected) {
            this.socket.emit("joinChat", conversationId);
        }
    }

    leaveRoom(conversationId: string) {
        if (!conversationId) return;

        this.joinedRooms.delete(conversationId);

        if (this.socket?.connected) {
            this.socket.emit("leaveChat", conversationId);
        }
    }

    sendTyping(conversationId: string, isTyping: boolean) {
        if (!conversationId) return;

        this.socket?.emit("typing", {
            conversationId,
            isTyping,
        });
    }

    emit(event: string, data?: any, callback?: (...args: any[]) => void) {
        if (!this.socket?.connected) {
            this.connect();
        }

        this.socket?.emit(event, data, callback);
    }

    on(event: string, callback: SocketCallback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)?.add(callback);

        if (this.socket) {
            this.socket.off(event, callback);
            this.socket.on(event, callback);
        } else {
            this.connect();
        }

        return () => {
            this.listeners.get(event)?.delete(callback);

            if (this.socket) {
                this.socket.off(event, callback);
            }

            if (this.listeners.get(event)?.size === 0) {
                this.listeners.delete(event);
            }
        };
    }

    disconnect() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }

        this.joinedRooms.clear();
        this.isConnected = false;

        this.socket?.disconnect();
        this.socket = null;
    }
}

export const socketService = new SocketService();