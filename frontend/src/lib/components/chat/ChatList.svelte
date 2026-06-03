<script lang="ts">
    import { goto } from "$app/navigation";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import ScrollArea from "$lib/components/ui/ScrollArea.svelte";
    import { socketService } from "$lib/services/socket.svelte";
    import { userService } from "$lib/services/user.service";
    import type { User } from "$lib/types/user.type";
    import type { ChatConversation } from "$lib/types/chat.type";

    let {
        conversations,
        activeChat = $bindable(),
        isLoading = true,
    } = $props<{
        conversations: ChatConversation[];
        activeChat: ChatConversation | null;
        isLoading: boolean;
    }>();

    let suggestedUsers = $state<User[]>([]);
    let searchQuery = $state("");
    let isSearching = $state(false);
    let hasLoadedSuggestions = $state(false);

    async function loadSuggestedUsers(query = "") {
        isSearching = true;

        try {
            const res = await userService.listUsers({
                limit: 5,
                search: query,
            });

            suggestedUsers = res.data;
        } catch (error) {
            console.error("Lỗi lấy danh sách user:", error);
            suggestedUsers = [];
        } finally {
            isSearching = false;
        }
    }

    $effect(() => {
        if (
            isLoading === false &&
            conversations.length === 0 &&
            !hasLoadedSuggestions
        ) {
            loadSuggestedUsers();
            hasLoadedSuggestions = true;
        }
    });

    $effect(() => {
        const q = searchQuery.trim();

        if (!q) return;

        const timeout = setTimeout(() => {
            loadSuggestedUsers(q);
        }, 300);

        return () => clearTimeout(timeout);
    });

    function getOnlineStatus(conv: ChatConversation) {
        if (!conv.peerId) return conv.online;

        const socketOnline = socketService.onlineUsers[conv.peerId];

        if (socketOnline !== undefined) {
            return socketOnline;
        }

        return conv.online;
    }

    function getConversationHref(conv: ChatConversation) {
        return `/chat?conversationId=${conv.id}`;
    }

    function startNewChat(user: User) {
        activeChat = {
            id: `temp_${user.id}`,
            type: "CHAT",
            scope: "GENERAL",
            name: user.fullname || user.username || "User",
            avatar: user.avatar,
            peerId: user.id,
            online: true,
            unreadCount: 0,
            lastMsg: "",
            topic_id: null,
            challenge_id: null,
        };

        goto(`/chat?userId=${user.id}`, {
            noScroll: true,
            keepFocus: true,
        });
    }
</script>

<aside class="conv-list">
    <div class="list-header">
        <h2>Messages</h2>

        <div class="search-box">
            <Input bind:value={searchQuery} placeholder="Search users...">
                {#snippet icon()}
                    <Icon name="search" size={18} />
                {/snippet}
            </Input>
        </div>
    </div>

    <ScrollArea class="conversations-list">
        {#if isLoading}
            <div class="loading-state">
                <Loading size="md" message="Loading conversations..." />
            </div>
        {:else if conversations.length > 0}
            {#each conversations as conv (conv.id)}
                <a
                    class="conv-item {activeChat?.id === conv.id
                        ? 'active'
                        : ''}"
                    href={getConversationHref(conv)}
                    onclick={() => (activeChat = conv)}
                >
                    <div class="avatar-wrapper">
                        <Avatar name={conv.name} src={conv.avatar} size="md" />

                        {#if conv.type === "CHAT"}
                            <div
                                class="status-dot {getOnlineStatus(conv)
                                    ? 'online'
                                    : ''}"
                            ></div>
                        {/if}
                    </div>

                    <div class="conv-info">
                        <span class="name">{conv.name}</span>

                        {#if socketService.typingStatus[conv.id]}
                            <span class="typing-text">đang nhập...</span>
                        {:else}
                            <span class="last-msg">
                                {conv.lastMsg || "No messages yet"}
                            </span>
                        {/if}
                    </div>

                    {#if conv.unreadCount > 0}
                        <div class="unread-badge-end">
                            <Badge color="danger" size="sm">
                                {conv.unreadCount}
                            </Badge>
                        </div>
                    {/if}
                </a>
            {/each}
        {:else}
            <div class="empty-state-list">
                <div class="empty-icon">
                    <Icon name="message-square" size={32} />
                </div>

                <p class="empty-text">No conversations yet</p>

                <div class="suggested-section">
                    <h4>Suggested People</h4>

                    {#if isSearching}
                        <Loading size="sm" message="Searching..." />
                    {:else if suggestedUsers.length === 0}
                        <p class="empty-text" style="margin-top: 10px;">
                            No users yet.
                        </p>
                    {:else}
                        <div class="suggested-list">
                            {#each suggestedUsers as user (user.id)}
                                <div class="suggested-item">
                                    <Avatar
                                        name={(user.fullname ||
                                            user.username) ??
                                            "User"}
                                        src={user.avatar ?? undefined}
                                        size="sm"
                                    />

                                    <div class="suggested-info">
                                        <span class="name">
                                            {user.fullname || user.username}
                                        </span>
                                    </div>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onclick={() => startNewChat(user)}
                                    >
                                        Chat
                                    </Button>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        {/if}
    </ScrollArea>
</aside>

<style>
    .conv-list {
        border-right: 1px solid #252a33;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #171a21;
    }

    .list-header {
        padding: 18px;
        color: #f3f4f6;
        border-bottom: 1px solid #252a33;
    }

    .list-header h2 {
        margin: 0 0 14px 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: -0.02em;
        color: #f3f4f6;
    }

    .search-box {
        width: 100%;
    }

    :global(.conversations-list) {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .conv-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        width: 100%;
        border: none;
        background: transparent;
        color: #f3f4f6;
        cursor: pointer;
        transition:
            background-color 0.16s ease,
            transform 0.16s ease;
        text-align: left;
        text-decoration: none;
    }

    .conv-item:hover {
        background: #1c2029;
    }

    .conv-item.active {
        background: #20242d;
    }

    .avatar-wrapper {
        position: relative;
        flex-shrink: 0;
    }

    .unread-badge-end {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8px;
    }

    .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #171a21;
        background: #6b7280;
        transition: background-color 0.2s ease;
    }

    .status-dot.online {
        background: #22c55e;
    }

    .conv-info {
        flex: 1;
        overflow: hidden;
        min-width: 0;
    }

    .conv-info .name {
        display: block;
        font-weight: 500;
        font-size: 13px;
        line-height: 1.35;
        margin-bottom: 3px;
        color: #f3f4f6;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "Poppins";
    }

    .conv-info .last-msg {
        font-family: "Poppins";
        font-size: 12px;
        line-height: 1.35;
        color: #8b949e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }

    .typing-text {
        color: #22c55e;
        font-size: 12px;
        font-style: italic;
    }

    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        min-height: 200px;
        color: #8b949e;
    }

    .empty-state-list {
        padding: 30px 20px;
        text-align: center;
    }

    .empty-icon {
        color: #6b7280;
        margin-bottom: 12px;
        display: flex;
        justify-content: center;
    }

    .empty-text {
        color: #8b949e;
        font-size: 14px;
        margin: 0 0 30px 0;
    }

    .suggested-section {
        text-align: left;
    }

    .suggested-section h4 {
        color: #d1d5db;
        font-size: 12px;
        font-weight: 600;
        margin: 0 0 14px 0;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .suggested-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .suggested-item {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #1c2029;
        padding: 10px;
        border-radius: 12px;
        transition: background 0.16s;
    }

    .suggested-item:hover {
        background: #20242d;
    }

    .suggested-info {
        flex: 1;
        overflow: hidden;
        min-width: 0;
    }

    .suggested-info .name {
        display: block;
        color: #f3f4f6;
        font-size: 13px;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
