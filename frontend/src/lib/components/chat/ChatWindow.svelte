<script lang="ts">
    import { socketService } from "$lib/services/socket.svelte";
    import { authState } from "$lib/states/auth.svelte";
    import { chatService } from "$lib/services/chat.service";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";

    let { activeChat } = $props<{ activeChat: any }>();
    let messages = $state<any[]>([]);
    let newMessage = $state("");
    let chatContainer = $state<HTMLElement | null>(null);

    $effect(() => {
        if (messages.length && chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    });

    $effect(() => {
        async function fetchHistory() {
            try {
                const data = (await chatService.getMessages(
                    activeChat.id,
                )) as any[];
                messages = data.map((m: any) => ({
                    id: m.id,
                    senderId: m.Sender.id,
                    text: m.content,
                    time: new Date(m.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                }));
            } catch (error) {
                console.error("Lỗi tải lịch sử tin nhắn:", error);
            }
        }

        if (activeChat) {
            messages = []; // Clear tin nhắn của người cũ
            fetchHistory();
        }
    });

    $effect(() => {
        const unsub = socketService.on("chat:message:new", (data) => {
            const incomingConvId = data.conversationId || data.conversation_id;
            const msgData = data.message || data;

            if (incomingConvId === activeChat.id) {
                const exists = messages.some((m) => m.id === msgData.id);
                if (!exists) {
                    messages.push({
                        id: msgData.id,
                        senderId: msgData.sender_id,
                        text: msgData.content,
                        time: new Date(msgData.sent_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    });
                }
            }
        });
        return unsub;
    });

    async function sendMessage() {
        if (!newMessage.trim()) return;

        const tempText = newMessage;
        newMessage = "";
        socketService.sendTyping(activeChat.id, false);

        try {
            await chatService.sendMessage({
                toUserId: activeChat.peerId,
                content: tempText,
            });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);
        }
    }
</script>

<header class="chat-header">
    <div class="user-meta">
        <strong>{activeChat.name}</strong>
        <span class="status {activeChat.online ? 'online' : ''}">
            {activeChat.online ? "Online" : "Offline"}
        </span>
    </div>
</header>

<div class="message-list" bind:this={chatContainer}>
    {#each messages as msg}
        <div
            class="msg-wrapper {msg.senderId === (authState.user?.id || 1)
                ? 'me'
                : 'them'}"
        >
            <div class="msg-bubble">{msg.text}</div>
            <span class="time">{msg.time}</span>
        </div>
    {/each}
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
                oninput={() => socketService.sendTyping(activeChat.id, true)}
                placeholder="Type a message..."
            />
        </div>
        <Button type="submit" variant="primary">
            <Icon name="reply" />
        </Button>
    </form>
</footer>

<style>
    /* Header */
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

    /* Message List */
    .message-list {
        flex: 1;
        overflow-y: auto;
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

    /* Bong bóng chat */
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

    /* Input Area */
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
        flex: 1; /* Để thẻ input giãn hết không gian còn lại */
    }
</style>
