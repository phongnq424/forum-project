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
        ChatAttachment,
        ChatConversation,
        ChatMessage,
        ChatMessageApiItem,
    } from "$lib/types/chat.type";

    let {
        activeChat,
        online = false,
        onConversationCreated,
        onMessagesChange,
    } = $props<{
        activeChat: ChatConversation;
        online?: boolean;
        onConversationCreated?: (chat: ChatConversation) => void;
        onMessagesChange?: (messages: ChatMessage[]) => void;
    }>();

    let messages = $state<ChatMessage[]>([]);
    let newMessage = $state("");
    let selectedFiles = $state<File[]>([]);
    let isLoading = $state(true);
    let isSending = $state(false);

    function setMessages(next: ChatMessage[]) {
        messages = next;
        onMessagesChange?.(next);
    }

    function normalizeMessage(m: ChatMessageApiItem): ChatMessage {
        return {
            id: m.id,
            senderId: m.Sender?.id || m.sender_id || "",
            text: m.content || "",
            time: new Date(m.sent_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            attachments: m.Attachment || [],
        };
    }

    function buildFallbackText(files: File[]) {
        if (files.length === 0) return "";

        const hasImage = files.some((file) => file.type.startsWith("image/"));
        const hasVideo = files.some((file) => file.type.startsWith("video/"));

        if (hasImage) return "Đang gửi ảnh...";
        if (hasVideo) return "Đang gửi video...";
        return "Đang gửi tệp đính kèm...";
    }

    function formatSize(size?: number | null) {
        if (!size) return "";
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
    }

    function handleFiles(event: Event) {
        const input = event.target as HTMLInputElement;
        selectedFiles = input.files ? Array.from(input.files) : [];
    }

    function removeSelectedFile(index: number) {
        selectedFiles = selectedFiles.filter((_, i) => i !== index);
    }

    async function openAttachment(attachment: ChatAttachment) {
        try {
            const result = await chatService.getAttachmentUrl(attachment.id);
            window.open(result.url, "_blank");
        } catch (error) {
            console.error("Lỗi mở attachment:", error);
        }
    }

    function upsertRealMessage(
        tempId: string,
        realMessage: ChatMessageApiItem,
    ) {
        const normalized = normalizeMessage(realMessage);
        const realExists = messages.some((item) => item.id === normalized.id);

        if (realExists) {
            setMessages(messages.filter((item) => item.id !== tempId));
            return;
        }

        setMessages(
            messages.map((item) => (item.id === tempId ? normalized : item)),
        );
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
                setMessages([]);
                isLoading = false;
                return;
            }

            const currentId = activeChat.id;
            isLoading = true;

            try {
                const data = await chatService.getMessages(currentId);

                if (currentId === activeChat.id) {
                    setMessages(data.map(normalizeMessage));
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
                    setMessages([...messages, normalizeMessage(msgData)]);
                }
            }
        });

        return unsub;
    });

    async function sendMessage() {
        const text = newMessage.trim();
        const files = selectedFiles;

        if (!text && files.length === 0) return;
        if (isSending) return;

        newMessage = "";
        selectedFiles = [];
        isSending = true;

        const tempId = `temp-${Date.now()}`;
        const currentSocketId = socketService.socket?.id;

        const optimisticMsg: ChatMessage = {
            id: tempId,
            senderId: authState.user?.id || "",
            text: text || buildFallbackText(files),
            time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            attachments: [],
        };

        setMessages([...messages, optimisticMsg]);

        try {
            const realConversation = await ensureRealConversation();

            socketService.sendTyping(realConversation.id, false);

            if (files.length > 0) {
                let result: ChatMessageApiItem;

                if (realConversation.type === "GROUP") {
                    result = await chatService.sendGroupMessage({
                        conversationId: realConversation.id,
                        content: text,
                        files,
                    });
                } else {
                    if (!realConversation.peerId) {
                        throw new Error("Missing peerId");
                    }

                    result = await chatService.sendMessage({
                        toUserId: realConversation.peerId,
                        content: text,
                        files,
                    });
                }

                upsertRealMessage(tempId, result);
                return;
            }

            socketService.emit("chat:message:send", {
                conversationId: realConversation.id,
                content: text,
                tempId,
                socketId: currentSocketId,
            });
        } catch (error) {
            console.error("Lỗi gửi tin nhắn:", error);

            setMessages(
                messages.map((m) =>
                    m.id === tempId
                        ? {
                              ...m,
                              text: `${m.text} (failed)`,
                          }
                        : m,
                ),
            );
        } finally {
            isSending = false;
        }
    }
</script>

<div class="chat-window">
    <header class="chat-header">
        <div class="user-meta">
            <strong>{activeChat.name}</strong>

            {#if activeChat.type === "CHAT"}
                <span class="status {online ? 'online' : ''}">
                    {online ? "Online" : "Offline"}
                </span>
            {:else}
                <span class="status">
                    {activeChat.scope.replaceAll("_", " ").toLowerCase()}
                </span>
            {/if}
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
                        <div class="msg-bubble">
                            {#if msg.text}
                                <div class="message-text">{msg.text}</div>
                            {/if}

                            {#if msg.attachments && msg.attachments.length > 0}
                                <div class="attachments">
                                    {#each msg.attachments as attachment (attachment.id)}
                                        {#if attachment.file_type === "IMAGE" && attachment.url}
                                            <img
                                                class="attachment-image"
                                                src={attachment.url}
                                                alt={attachment.original_name ||
                                                    "image"}
                                            />
                                        {:else if attachment.file_type === "DOCUMENT"}
                                            <button
                                                type="button"
                                                class="attachment-file"
                                                onclick={() =>
                                                    openAttachment(attachment)}
                                            >
                                                {#if attachment.preview_url}
                                                    <img
                                                        class="attachment-preview"
                                                        src={attachment.preview_url}
                                                        alt={attachment.original_name ||
                                                            "document preview"}
                                                    />
                                                {/if}

                                                <span class="attachment-name">
                                                    {attachment.original_name ||
                                                        "Document"}
                                                </span>

                                                <span class="attachment-meta">
                                                    {attachment.mime_type ||
                                                        "document"}
                                                    {#if attachment.size}
                                                        · {formatSize(
                                                            attachment.size,
                                                        )}
                                                    {/if}
                                                </span>
                                            </button>
                                        {:else}
                                            <button
                                                type="button"
                                                class="attachment-file"
                                                onclick={() =>
                                                    openAttachment(attachment)}
                                            >
                                                <span class="attachment-name">
                                                    {attachment.original_name ||
                                                        "Attachment"}
                                                </span>

                                                <span class="attachment-meta">
                                                    {attachment.mime_type ||
                                                        "file"}
                                                    {#if attachment.size}
                                                        · {formatSize(
                                                            attachment.size,
                                                        )}
                                                    {/if}
                                                </span>
                                            </button>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                        </div>

                        <span class="time">{msg.time}</span>
                    </div>
                {/each}
            </div>
        </ScrollArea>
    </div>

    <footer class="chat-input-area">
        {#if selectedFiles.length > 0}
            <div class="selected-files">
                {#each selectedFiles as file, index}
                    <div class="selected-file">
                        <span>{file.name}</span>

                        <button
                            type="button"
                            onclick={() => removeSelectedFile(index)}
                        >
                            ×
                        </button>
                    </div>
                {/each}
            </div>
        {/if}

        <form
            onsubmit={(e) => {
                e.preventDefault();
                sendMessage();
            }}
        >
            <label class="file-button" aria-label="Attach files">
                <Icon name="folder" size={18} />
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    onchange={handleFiles}
                />
            </label>

            <div class="input-wrapper">
                <Input
                    bind:value={newMessage}
                    oninput={() =>
                        socketService.sendTyping(activeChat.id, true)}
                    placeholder="Type a message..."
                />
            </div>

            <Button
                type="submit"
                variant="primary"
                disabled={isSending ||
                    (!newMessage.trim() && selectedFiles.length === 0)}
            >
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
        text-transform: capitalize;
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

    .message-text {
        white-space: pre-wrap;
    }

    .attachments {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
    }

    .attachment-image {
        max-width: 260px;
        max-height: 260px;
        border-radius: 12px;
        object-fit: cover;
        display: block;
    }

    .attachment-file {
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(0, 0, 0, 0.14);
        color: inherit;
        border-radius: 12px;
        padding: 10px;
        text-align: left;
        cursor: pointer;
        max-width: 280px;
    }

    .attachment-file:hover {
        background: rgba(255, 255, 255, 0.08);
    }

    .attachment-preview {
        width: 100%;
        max-height: 180px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
        margin-bottom: 8px;
    }

    .attachment-name {
        display: block;
        font-size: 13px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .attachment-meta {
        display: block;
        font-size: 11px;
        color: #9ca3af;
        margin-top: 3px;
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

    .file-button {
        width: 42px;
        min-width: 42px;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        background: #20242d;
        color: #d1d5db;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .file-button:hover {
        background: #252a33;
    }

    .file-button input {
        display: none;
    }

    .selected-files {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 10px;
    }

    .selected-file {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        max-width: 220px;
        padding: 6px 8px;
        border-radius: 999px;
        background: #20242d;
        color: #d1d5db;
        font-size: 12px;
    }

    .selected-file span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .selected-file button {
        border: none;
        background: transparent;
        color: #9ca3af;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
    }
</style>
