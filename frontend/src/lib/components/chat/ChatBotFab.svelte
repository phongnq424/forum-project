<script lang="ts">
    import { socketService } from "$lib/services/socket.svelte";
    import { authState } from "$lib/states/auth.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";

    // 1. Quản lý trạng thái ẩn/hiện
    const hiddenRoutes = ["/login", "/register", "/admin"];
    let isHidden = $derived(
        hiddenRoutes.some((route) => page.url.pathname.startsWith(route)),
    );
    let isOpen = $state(false);

    // 2. Quản lý tin nhắn
    let messages = $state<any[]>([
        {
            id: "start",
            senderId: "bot",
            text: "Chào bạn! Mình là AI Assistant. Bạn cần mình hỗ trợ gì về các thử thách không?",
            time: "AI",
        },
    ]);
    let newMessage = $state("");
    let isTyping = $state(false);

    // Toggle đóng mở
    function toggleChat() {
        isOpen = !isOpen;
    }

    // 3. Logic gửi tin nhắn (Bắt chước kiểu Optimistic UI của bạn)
    async function sendMessage() {
        if (!newMessage.trim()) return;

        const text = newMessage;
        newMessage = "";
        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        // User gửi tin nhắn
        messages = [
            ...messages,
            {
                id: `user-${Date.now()}`,
                senderId: authState.user?.id,
                text,
                time,
            },
        ];

        isTyping = true; // Bot bắt đầu "suy nghĩ"

        // Ở đây bạn có thể emit socket hoặc gọi API AI của bạn
        // socketService.emit("ai:ask", { content: text });

        // Giả lập bot trả lời sau 1s
        setTimeout(() => {
            messages = [
                ...messages,
                {
                    id: `bot-${Date.now()}`,
                    senderId: "bot",
                    text: `Cảm ơn bạn đã hỏi về "${text}". Hiện tại mình đang được nâng cấp để trả lời thông minh hơn!`,
                    time: "AI",
                },
            ];
            isTyping = false;
        }, 1000);
    }
</script>

{#if !isHidden}
    {#if isOpen}
        <div class="chat-container" in:fly={{ y: 20, duration: 300 }} out:fade>
            <header class="chat-header">
                <div class="bot-info">
                    <div class="bot-avatar">
                        <Icon name="bot" size={20} />
                    </div>
                    <div>
                        <strong>AI Assistant</strong>
                        <span class="status">Online</span>
                    </div>
                </div>
                <button
                    type="button"
                    class="close-btn"
                    onclick={toggleChat}
                    aria-label="Close chatbot"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </header>

            <div class="messages-area">
                <ScrollArea scrollToBottom={true} watch={messages}>
                    <div class="message-list">
                        {#each messages as msg}
                            <div
                                class="msg-wrapper {msg.senderId === 'bot'
                                    ? 'them'
                                    : 'me'}"
                            >
                                <div class="msg-bubble">{msg.text}</div>
                                <span class="time">{msg.time}</span>
                            </div>
                        {/each}

                        {#if isTyping}
                            <div class="msg-wrapper them">
                                <div class="msg-bubble typing">
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                </div>
                            </div>
                        {/if}
                    </div>
                </ScrollArea>
            </div>

            <footer class="input-area">
                <form
                    onsubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    <div class="input-wrapper">
                        <Input
                            bind:value={newMessage}
                            placeholder="Hỏi AI gì đó..."
                        />
                    </div>
                    <Button type="submit" variant="primary" size="sm">
                        <Icon name="reply" size={18} />
                    </Button>
                </form>
            </footer>
        </div>
    {/if}

    <button class="chat-fab" onclick={toggleChat} aria-label="Toggle Chat">
        {#if isOpen}
            <Icon name="bot" size={28} />
            <span class="online-dot"></span>
        {:else}
            <Icon name="bot" size={28} />
            <span class="online-dot"></span>
        {/if}
    </button>
{/if}

<style>
    /* FAB Button */
    .chat-fab {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none;
        color: white;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
        cursor: pointer;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }
    .chat-fab:hover {
        transform: scale(1.05);
    }

    .online-dot {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 12px;
        height: 12px;
        background: #10b981;
        border: 2px solid #16191f;
        border-radius: 50%;
    }

    /* Main Window - Dựa trên style ChatWindow của bạn */
    .chat-container {
        position: fixed;
        bottom: 100px;
        right: 30px;
        width: 380px;
        height: 550px;
        max-height: 70vh;
        background: #16191f;
        border: 1px solid #2a2e36;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        z-index: 999;
    }

    .chat-header {
        padding: 15px 20px;
        background: #1c1f26;
        border-bottom: 1px solid #2a2e36;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .bot-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .bot-avatar {
        width: 32px;
        height: 32px;
        background: #6366f1;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .bot-info strong {
        font-size: 14px;
        color: white;
        display: block;
    }
    .status {
        font-size: 11px;
        color: #10b981;
    }

    .close-btn {
        background: none;
        border: none;
        color: #6b7280;
        cursor: pointer;
    }

    .messages-area {
        flex: 1;
        min-height: 0;
    }
    .message-list {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .msg-wrapper {
        max-width: 85%;
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
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
    }

    .me .msg-bubble {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-bottom-right-radius: 2px;
    }

    .them .msg-bubble {
        background: #2a2e36;
        color: #e5e7eb;
        border-bottom-left-radius: 2px;
    }

    .time {
        font-size: 10px;
        color: #6b7280;
        margin-top: 4px;
    }

    .input-area {
        padding: 15px;
        border-top: 1px solid #2a2e36;
    }
    .input-area form {
        display: flex;
        gap: 10px;
    }
    .input-wrapper {
        flex: 1;
    }

    /* Typing Animation */
    .typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px !important;
    }
    .dot {
        width: 6px;
        height: 6px;
        background: #6b7280;
        border-radius: 50%;
        animation: blink 1.4s infinite;
    }
    .dot:nth-child(2) {
        animation-delay: 0.2s;
    }
    .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes blink {
        0%,
        100% {
            opacity: 0.3;
            transform: scale(1);
        }
        50% {
            opacity: 1;
            transform: scale(1.1);
        }
    }
</style>
