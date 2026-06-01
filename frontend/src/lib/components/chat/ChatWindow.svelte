<script lang="ts">
    import { socketService } from "$lib/services/socket.svelte";
    import { authState } from "$lib/states/auth.svelte";
    import { chatService } from "$lib/services/chat.service";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import type {
        ChatConversation,
        ChatMessage,
        ChatMessageApiItem,
    } from "$lib/types/chat.type";

    let { activeChat, onConversationCreated } = $props<{
        activeChat: ChatConversation;
        onConversationCreated?: (conversation: ChatConversation) => void;
    }>();

    let messages = $state<ChatMessage[]>([]);
    let newMessage = $state("");
    let isLoading = $state(true);

    function normalizeMessage(m: ChatMessageApiItem): ChatMessage {
        return {
            id: m.id,
            senderId: m.Sender?.id || m.sender_id || "",
            text: m.content,
            time: new Date(m.sent_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };
    }

    async function ensureRealConversation(): Promise<ChatConversation> {
        if (!activeChat.id.startsWith("temp_")) {
            return activeChat;
        }

        if (!activeChat.peerId) {
            throw new Error("Missing peerId");
        }

        const created = await chatService.createChat(activeChat.peerId);
        const realId = created.conversationId || created.id;

        if (!realId) {
            throw new Error("Cannot create conversation");
        }

        const realConversation: ChatConversation = {
            ...activeChat,
            id: realId,
        };

        socketService.joinRoom(realId);
        onConversationCreated?.(realConversation);

        return realConversation;
    }

    $effect(() => {
        if (
            activeChat &&
            socketService.isConnected &&
            !activeChat.id.startsWith("temp_")
        ) {
            socketService.joinRoom(activeChat.id);
        }

        return () => {
            if (
                activeChat &&
                socketService.isConnected &&
                !activeChat.id.startsWith("temp_")
            ) {
                socketService.leaveRoom(activeChat.id);
            }
        };
    });

    $effect(() => {
        async function fetchHistory() {
            if (!activeChat || activeChat.id.startsWith("temp_")) {
                messages = [];
                isLoading = false;
                return;
            }

            const currentId = activeChat.id;
            isLoading = true;

            try {
                const data = await chatService.getMessages(currentId);

                if (currentId === activeChat.id) {
                    messages = data.map(normalizeMessage);
                }
            } catch (error) {
                console.error("Lỗi tải lịch sử tin nhắn:", error);
                messages = [];
            } finally {
                if (currentId === activeChat.id) {
                    isLoading = false;
                }
            }
        }

        fetchHistory();
    });

    $effect(() => {
        const unsub = socketService.on("chat:message:new", (data: any) => {
            if (!activeChat) return;

            const incomingConvId = data.conversationId || data.conversation_id;
            const msgData = data.message || data;

            if (incomingConvId === activeChat.id) {
                const exists = messages.some((m) => m.id === msgData.id);

                if (!exists) {
                    messages = [
                        ...messages,
                        {
                            id: msgData.id,
                            senderId: msgData.sender_id,
                            text: msgData.content,
                            time: new Date(msgData.sent_at).toLocaleTimeString(
                                [],
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            ),
                        },
                    ];
                }
            }
        });

        return unsub;
    });

    async function sendMessage() {
        if (!newMessage.trim()) return;

        const text = newMessage.trim();
        newMessage = "";

        const tempId = `temp-${Date.now()}`;
        const currentSocketId = socketService.socket?.id;

        const optimisticMsg: ChatMessage = {
            id: tempId,
            senderId: authState.user?.id || "",
            text,
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        messages = [...messages, optimisticMsg];

        try {
            const realConversation = await ensureRealConversation();

            socketService.sendTyping(realConversation.id, false);

            socketService.emit("chat:message:send", {
                conversationId: realConversation.id,
                content: text,
                tempId,
                socketId: currentSocketId,
            });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);

            messages = messages.map((m) =>
                m.id === tempId
                    ? {
                          ...m,
                          text: `${m.text} (failed)`,
                      }
                    : m,
            );
        }
    }
</script>

<div class="chat-window">
    <header class="chat-header">
        <div class="user-meta">
            <strong>{activeChat.name}</strong>
            <span class="status {activeChat.online ? 'online' : ''}">
                {activeChat.online ? "Online" : "Offline"}
            </span>
        </div>
    </header>

    <div class="messages-container">
        <ScrollArea scrollToBottom={true} watch={messages} pushToBottom>
            <div class="message-list">
                {#if isLoading}
                    <Loading message="Loading Messages..." size="md" />
                {/if}

                {#each messages as msg (msg.id)}
                    <div
                        class="msg-wrapper {msg.senderId === authState.user?.id
                            ? 'me'
                            : 'them'}"
                    >
                        <div class="msg-bubble">{msg.text}</div>
                        <span class="time">{msg.time}</span>
                    </div>
                {/each}
            </div>
        </ScrollArea>
    </div>

    <footer class="chat-input-area">
        <form
            onsubmit={(e) => {
                e.preventDefault();
                sendMessage();
            }}
        >
            <div class="input-wrapper">
                <Input
                    bind:value={newMessage}
                    oninput={() =>
                        socketService.sendTyping(activeChat.id, true)}
                    placeholder="Type a message..."
                />
            </div>

            <Button type="submit" variant="primary">
                <Icon name="reply" />
            </Button>
        </form>
    </footer>
</div>

<style>
    .chat-window {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        background: #16191f;
    }

    .chat-header {
        padding: 20px 25px;
        border-bottom: 1px solid #2a2e36;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #16191f;
        color: white;
    }

    .user-meta strong {
        font-size: 18px;
        display: block;
        margin-bottom: 4px;
    }

    .status {
        font-size: 12px;
        color: #9ca3af;
    }

    .status.online {
        color: #10b981;
    }

    .messages-container {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }

    .messages-container :global(.scroll-area) {
        flex: 1;
        min-height: 0;
    }

    .message-list {
        min-height: 0;
        padding: 25px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .msg-wrapper {
        max-width: 70%;
        display: flex;
        flex-direction: column;
    }

    .msg-wrapper.me {
        align-self: flex-end;
        align-items: flex-end;
    }

    .msg-wrapper.them {
        align-self: flex-start;
        align-items: flex-start;
    }

    .msg-bubble {
        padding: 12px 18px;
        border-radius: 16px;
        font-size: 14.5px;
        line-height: 1.5;
        word-break: break-word;
    }

    .me .msg-bubble {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-bottom-right-radius: 4px;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2);
    }

    .them .msg-bubble {
        background: #2a2e36;
        color: #e5e7eb;
        border-bottom-left-radius: 4px;
    }

    .time {
        font-size: 11px;
        color: #6b7280;
        margin-top: 6px;
    }

    .chat-input-area {
        padding: 20px;
        border-top: 1px solid #2a2e36;
        background: #16191f;
    }

    .chat-input-area form {
        display: flex;
        gap: 12px;
        align-items: stretch;
    }

    .input-wrapper {
        flex: 1;
    }
</style>
