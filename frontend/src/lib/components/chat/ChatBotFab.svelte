<script lang="ts">
    import { AiService } from "$lib/services/ai.service";
    import { authState } from "$lib/states/auth.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
    import { fade, fly } from "svelte/transition";
    import { page } from "$app/state";
    import { onMount } from "svelte";
    import { marked } from "marked";
    import DOMPurify from "dompurify";

    type ChatMessage = {
        id?: string;
        senderId: string | undefined;
        text: string;
        time: string;
    };

    marked.setOptions({
        gfm: true,
        breaks: true,
    });

    const hiddenRoutes = ["/login", "/register", "/admin"];

    let isHidden = $derived(
        hiddenRoutes.some((route) => page.url.pathname.startsWith(route)),
    );

    let isOpen = $state(false);
    let messages = $state<ChatMessage[]>([]);
    let newMessage = $state("");
    let isTyping = $state(false);
    let isLoadingHistory = $state(true);

    function renderMarkdown(text: string) {
        const html = marked.parse(text || "", {
            async: false,
        }) as string;

        return DOMPurify.sanitize(html);
    }

    onMount(async () => {
        try {
            const response = await AiService.getHistory();

            if (Array.isArray(response)) {
                messages = response.map((msg: any) => ({
                    id: msg.id || `${msg.role}-${msg.timestamp || Date.now()}`,
                    senderId: msg.role === "user" ? authState.user?.id : "bot",
                    text: msg.content,
                    time: msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                          })
                        : "AI",
                }));
            }

            if (!messages.length) {
                messages = [
                    {
                        id: "start",
                        senderId: "bot",
                        text: "Hi! I'm WindFlow AI Assistant. You need any help?",
                        time: "AI",
                    },
                ];
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);

            messages = [
                {
                    id: "start",
                    senderId: "bot",
                    text: "Hi! I'm WindFlow AI Assistant. You need any help?",
                    time: "AI",
                },
            ];
        } finally {
            isLoadingHistory = false;
        }
    });

    function toggleChat() {
        isOpen = !isOpen;
    }

    async function sendMessage() {
        if (!newMessage.trim() || isTyping) return;

        const text = newMessage.trim();
        newMessage = "";

        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

        messages = [
            ...messages,
            {
                id: `user-${Date.now()}`,
                senderId: authState.user?.id,
                text,
                time,
            },
        ];

        isTyping = true;

        try {
            const response = await AiService.sendMessage({ message: text });

            if (response.reply) {
                messages = [
                    ...messages,
                    {
                        id: `bot-${Date.now()}`,
                        senderId: "bot",
                        text: response.reply,
                        time: "AI",
                    },
                ];
            }
        } catch (error) {
            console.error("Failed to send message:", error);

            messages = [
                ...messages,
                {
                    id: `bot-${Date.now()}`,
                    senderId: "bot",
                    text: "Sorry, something went wrong. Please try again later.",
                    time: "AI",
                },
            ];
        } finally {
            isTyping = false;
        }
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
                        {#if isLoadingHistory}
                            <div class="msg-wrapper them">
                                <div class="msg-bubble typing">
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                    <span class="dot"></span>
                                </div>
                            </div>
                        {:else}
                            {#each messages as msg (msg.id)}
                                <div
                                    class="msg-wrapper {msg.senderId === 'bot'
                                        ? 'them'
                                        : 'me'}"
                                >
                                    <div class="msg-bubble">
                                        {#if msg.senderId === "bot"}
                                            <div class="markdown-content">
                                                {@html renderMarkdown(msg.text)}
                                            </div>
                                        {:else}
                                            {msg.text}
                                        {/if}
                                    </div>

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

                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isTyping || !newMessage.trim()}
                    >
                        <Icon name="reply" size={18} />
                    </Button>
                </form>
            </footer>
        </div>
    {/if}

    <button
        type="button"
        class="chat-fab"
        onclick={toggleChat}
        aria-label="Toggle Chat"
    >
        <Icon name="bot" size={28} />
        <span class="online-dot"></span>
    </button>
{/if}

<style>
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
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 8px;
    }

    .close-btn:hover {
        color: #e5e7eb;
        background: rgba(255, 255, 255, 0.04);
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
        max-width: 88%;
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
        max-width: 100%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 14px;
        line-height: 1.5;
        overflow-wrap: anywhere;
    }

    .me .msg-bubble {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        border-bottom-right-radius: 2px;
        white-space: pre-wrap;
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

    .markdown-content {
        font-size: 14px;
        line-height: 1.6;
        color: inherit;
        overflow-wrap: anywhere;
    }

    .markdown-content :global(p) {
        margin: 0 0 10px;
    }

    .markdown-content :global(p:last-child) {
        margin-bottom: 0;
    }

    .markdown-content :global(strong) {
        color: #f9fafb;
        font-weight: 700;
    }

    .markdown-content :global(ul),
    .markdown-content :global(ol) {
        margin: 8px 0 10px;
        padding-left: 20px;
    }

    .markdown-content :global(li) {
        margin: 4px 0;
    }

    .markdown-content :global(code) {
        padding: 2px 5px;
        border-radius: 5px;
        background: rgba(15, 17, 21, 0.8);
        color: #c4b5fd;
        font-size: 12px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
    }

    .markdown-content :global(pre) {
        margin: 10px 0;
        padding: 12px;
        border-radius: 10px;
        background: #111318;
        border: 1px solid #2a2e36;
        overflow-x: auto;
    }

    .markdown-content :global(pre code) {
        padding: 0;
        background: transparent;
        color: #e5e7eb;
        font-size: 12px;
        line-height: 1.6;
    }

    .markdown-content :global(a) {
        color: #a5b4fc;
        text-decoration: none;
        font-weight: 600;
    }

    .markdown-content :global(a:hover) {
        text-decoration: underline;
    }

    .markdown-content :global(blockquote) {
        margin: 10px 0;
        padding: 8px 12px;
        border-left: 3px solid #6366f1;
        background: rgba(99, 102, 241, 0.08);
        color: #d1d5db;
        border-radius: 8px;
    }

    .markdown-content :global(table) {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 12px;
    }

    .markdown-content :global(th),
    .markdown-content :global(td) {
        border: 1px solid #374151;
        padding: 6px 8px;
        text-align: left;
    }

    .markdown-content :global(th) {
        background: rgba(255, 255, 255, 0.04);
        color: #f9fafb;
    }

    @media (max-width: 520px) {
        .chat-container {
            right: 12px;
            left: 12px;
            bottom: 88px;
            width: auto;
            height: 72vh;
        }

        .chat-fab {
            right: 18px;
            bottom: 18px;
        }
    }
</style>
