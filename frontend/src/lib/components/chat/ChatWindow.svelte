<script lang="ts">
    import { socketService } from "$lib/services/socket.svelte";
    import { authState } from "$lib/states/auth.svelte";
    import { chatService } from "$lib/services/chat.service";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import VoiceButton from "$lib/components/ui/VoiceButton.svelte";
    import type { ChatConversation } from "$lib/types/chat.type";
    import type {
        ChatAttachment,
        ChatMessage,
        ChatMessageApiItem,
    } from "$lib/types/chat-common.type";

    type LocalChatMessage = ChatMessage & {
        clientKey: string;
        senderName: string;
        senderUsername?: string | null;
        senderAvatar?: string | null;
    };

    let {
        activeChat,
        online = false,
        onConversationCreated,
        onMessagesChange,
        onConversationPreviewUpdate,
    } = $props<{
        activeChat: ChatConversation;
        online?: boolean;
        onConversationCreated?: (chat: ChatConversation) => void;
        onMessagesChange?: (messages: ChatMessage[]) => void;
        onConversationPreviewUpdate?: (data: {
            conversationId: string;
            message: any;
            senderId?: string;
            incrementUnread?: boolean;
        }) => void;
    }>();

    let messages = $state<LocalChatMessage[]>([]);
    let newMessage = $state("");
    let selectedFiles = $state<File[]>([]);
    let isLoading = $state(true);
    let isSending = $state(false);
    let loadedConversationId = $state<string | null>(null);
    let voiceError = $state("");

    function getCurrentUserName() {
        const user = authState.user as any;

        return user?.fullname || user?.username || "You";
    }

    function getCurrentUserAvatar() {
        const user = authState.user as any;

        return user?.avatar || null;
    }

    function getSenderFromMessage(m: ChatMessageApiItem) {
        return (m as any).Sender || null;
    }

    function getSenderName(m: ChatMessageApiItem) {
        const sender = getSenderFromMessage(m);

        return sender?.fullname || sender?.username || "Unknown";
    }

    function getSenderUsername(m: ChatMessageApiItem) {
        const sender = getSenderFromMessage(m);

        return sender?.username || null;
    }

    function getSenderAvatar(m: ChatMessageApiItem) {
        const sender = getSenderFromMessage(m);

        return sender?.avatar || null;
    }

    function isMine(msg: LocalChatMessage) {
        return msg.senderId === authState.user?.id;
    }

    function shouldShowAvatar(msg: LocalChatMessage) {
        return !isMine(msg);
    }

    function shouldShowSenderName(msg: LocalChatMessage) {
        return activeChat.type === "GROUP" && !isMine(msg);
    }

    function setMessages(next: LocalChatMessage[]) {
        messages = next;
        onMessagesChange?.(next);
    }

    function normalizeMessage(
        m: ChatMessageApiItem,
        clientKey?: string,
    ): LocalChatMessage {
        return {
            id: m.id,
            clientKey: clientKey || m.id,
            senderId: m.Sender?.id || m.sender_id || "",
            senderName: getSenderName(m),
            senderUsername: getSenderUsername(m),
            senderAvatar: getSenderAvatar(m),
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

        if (hasImage) return "Sending photo...";
        if (hasVideo) return "Sending video...";
        return "Sending attachment...";
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

    function handleVoiceText(text: string) {
        voiceError = "";
        newMessage = text;

        if (!activeChat.id.startsWith("temp_")) {
            socketService.sendTyping(activeChat.id, true);
        }
    }

    function handleVoiceError(message: string) {
        voiceError = message;
    }

    async function openAttachment(attachment: ChatAttachment) {
        try {
            const result = await chatService.getAttachmentUrl(attachment.id);
            window.open(result.url, "_blank");
        } catch (error) {
            console.error("Error opening attachment:", error);
        }
    }

    function upsertRealMessage(
        tempId: string,
        realMessage: ChatMessageApiItem,
    ) {
        const normalized = normalizeMessage(realMessage, tempId);

        const realExists = messages.some((item) => item.id === normalized.id);

        if (realExists) {
            setMessages(messages.filter((item) => item.clientKey !== tempId));
            return;
        }

        setMessages(
            messages.map((item) =>
                item.clientKey === tempId ? normalized : item,
            ),
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
            const conversationId = activeChat?.id || "";

            if (!conversationId) {
                loadedConversationId = null;
                setMessages([]);
                isLoading = false;
                return;
            }

            if (conversationId.startsWith("temp_")) {
                loadedConversationId = conversationId;
                setMessages([]);
                isLoading = false;
                return;
            }

            if (loadedConversationId === conversationId) {
                return;
            }

            loadedConversationId = conversationId;
            isLoading = true;
            voiceError = "";

            try {
                const data = await chatService.getMessages(conversationId);

                if (activeChat.id === conversationId) {
                    setMessages(data.map((item) => normalizeMessage(item)));
                }
            } catch (error) {
                console.error("Error loading message history:", error);

                if (activeChat.id === conversationId) {
                    setMessages([]);
                }
            } finally {
                if (activeChat.id === conversationId) {
                    isLoading = false;
                }
            }
        }

        fetchHistory();
    });

    $effect(() => {
        const unsub = socketService.on("chat:message:new", (data: any) => {
            if (!activeChat) return;

            const msgData = data.message || data;

            const incomingConvId =
                data.conversationId ||
                data.conversation_id ||
                msgData.conversationId ||
                msgData.conversation_id;

            if (incomingConvId !== activeChat.id) return;

            const incomingTempId =
                data.tempId ||
                data.temp_id ||
                msgData.tempId ||
                msgData.temp_id;

            if (incomingTempId) {
                const hasTempMessage = messages.some(
                    (message) => message.clientKey === incomingTempId,
                );

                if (hasTempMessage) {
                    const normalized = normalizeMessage(
                        msgData,
                        incomingTempId,
                    );

                    setMessages(
                        messages.map((message) =>
                            message.clientKey === incomingTempId
                                ? normalized
                                : message,
                        ),
                    );
                    return;
                }
            }

            const normalized = normalizeMessage(msgData);

            const realExists = messages.some(
                (message) => message.id === normalized.id,
            );

            if (realExists) return;

            setMessages([...messages, normalized]);
        });

        return unsub;
    });

    async function sendMessage(textFromVoice?: string) {
        const text = (textFromVoice || newMessage).trim();
        const files = selectedFiles;

        if (!text && files.length === 0) return;
        if (isSending) return;

        newMessage = "";
        selectedFiles = [];
        voiceError = "";
        isSending = true;

        const tempId = `temp-${Date.now()}`;
        const currentSocketId = socketService.socket?.id;

        const optimisticMsg: LocalChatMessage = {
            id: tempId,
            clientKey: tempId,
            senderId: authState.user?.id || "",
            senderName: getCurrentUserName(),
            senderUsername: (authState.user as any)?.username || null,
            senderAvatar: getCurrentUserAvatar(),
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

            onConversationPreviewUpdate?.({
                conversationId: realConversation.id,
                message: {
                    id: tempId,
                    content: text || buildFallbackText(files),
                    Attachment: [],
                    Sender: {
                        id: authState.user?.id,
                        username: (authState.user as any)?.username,
                        fullname: (authState.user as any)?.fullname,
                        avatar: (authState.user as any)?.avatar,
                    },
                },
                senderId: authState.user?.id,
                incrementUnread: false,
            });

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

                onConversationPreviewUpdate?.({
                    conversationId: realConversation.id,
                    message: result,
                    senderId: authState.user?.id,
                    incrementUnread: false,
                });

                return;
            }

            socketService.emit("chat:message:send", {
                conversationId: realConversation.id,
                content: text,
                tempId,
                socketId: currentSocketId,
            });
        } catch (error) {
            console.error("Error sending message:", error);

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

                {#each messages as msg (msg.clientKey)}
                    <div class="msg-wrapper {isMine(msg) ? 'me' : 'them'}">
                        <div class="msg-row">
                            {#if shouldShowAvatar(msg)}
                                <div class="sender-avatar">
                                    <Avatar
                                        name={msg.senderName}
                                        src={msg.senderAvatar ?? undefined}
                                        size="sm"
                                    />
                                </div>
                            {/if}
                            <div class="msg-content">
                                {#if shouldShowSenderName(msg)}
                                    <div class="sender-name">
                                        {msg.senderName}
                                        {#if msg.senderUsername && msg.senderUsername !== msg.senderName}
                                            <span>@{msg.senderUsername}</span>
                                        {/if}
                                    </div>
                                {/if}

                                <div class="msg-bubble">
                                    {#if msg.text}
                                        <div class="message-text">
                                            {msg.text}
                                        </div>
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
                                                            openAttachment(
                                                                attachment,
                                                            )}
                                                    >
                                                        {#if attachment.preview_url}
                                                            <img
                                                                class="attachment-preview"
                                                                src={attachment.preview_url}
                                                                alt={attachment.original_name ||
                                                                    "document preview"}
                                                            />
                                                        {/if}

                                                        <span
                                                            class="attachment-name"
                                                        >
                                                            {attachment.original_name ||
                                                                "Document"}
                                                        </span>

                                                        <span
                                                            class="attachment-meta"
                                                        >
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
                                                            openAttachment(
                                                                attachment,
                                                            )}
                                                    >
                                                        <span
                                                            class="attachment-name"
                                                        >
                                                            {attachment.original_name ||
                                                                "Attachment"}
                                                        </span>

                                                        <span
                                                            class="attachment-meta"
                                                        >
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
                            </div>
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

        {#if voiceError}
            <div class="voice-error">{voiceError}</div>
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

            <VoiceButton
                disabled={isSending}
                onText={handleVoiceText}
                onError={handleVoiceError}
            />

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
        max-width: 78%;
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

    .msg-row {
        display: flex;
        align-items: flex-end;
        gap: 9px;
        max-width: 100%;
    }

    .msg-content {
        max-width: 100%;
        min-width: 0;
        display: flex;
        flex-direction: column;
    }

    .me .msg-content {
        align-items: flex-end;
    }

    .them .msg-content {
        align-items: flex-start;
    }

    .sender-avatar {
        flex-shrink: 0;
        margin-bottom: 2px;
    }

    .sender-name {
        max-width: 260px;
        margin: 0 0 5px;
        color: #d1d5db;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.3;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .me .sender-name {
        text-align: right;
    }

    .sender-name span {
        margin-left: 5px;
        color: #6b7280;
        font-weight: 500;
    }

    .msg-bubble {
        padding: 12px 18px;
        border-radius: 16px;
        font-size: 14.5px;
        line-height: 1.5;
        word-break: break-word;
        max-width: 100%;
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

    .them .time {
        margin-left: 42px;
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

    .voice-error {
        margin-bottom: 10px;
        color: #fca5a5;
        font-size: 12px;
    }

    @media (max-width: 640px) {
        .chat-header {
            padding: 14px 16px;
        }

        .message-list {
            padding: 18px 14px;
            gap: 16px;
        }

        .msg-wrapper {
            max-width: 92%;
        }

        .sender-name {
            max-width: 210px;
        }

        .chat-input-area {
            padding: 12px;
        }

        .chat-input-area form {
            gap: 8px;
        }

        .file-button {
            width: 38px;
            min-width: 38px;
        }

        .them .time {
            margin-left: 38px;
        }
    }
</style>
