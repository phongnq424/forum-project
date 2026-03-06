<script lang="ts">
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
    // Xóa import onMount vì không cần nữa

    let {
        conversations,
        activeChat = $bindable(),
        isLoading = true,
    } = $props<{
        conversations: any[];
        activeChat: any;
        isLoading: boolean;
    }>();

    let suggestedUsers = $state<User[]>([]);
    let searchQuery = $state("");
    let isSearching = $state(false);

    // Thêm một flag để tránh việc fetch lại nhiều lần
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
        } finally {
            isSearching = false;
        }
    }

    // Dùng $effect thay cho onMount
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
        conversations.forEach((conv: any) => {
            console.log(
                conv.peerId,
                socketService.onlineUsers[conv.peerId],
                conv.online,
            );
        });
    });

    function startNewChat(user: any) {
        activeChat = {
            id: `temp_${user.id}`,
            name: user.name,
            avatar: user.avatar,
            peerId: user.id,
            online: true,
            lastMsg: "",
        };
    }
</script>

<aside class="conv-list">
    <div class="list-header">
        <h2>Messages</h2>
        <div class="search-box">
            <Input placeholder="Search users...">
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
            {#each conversations as conv}
                <button
                    class="conv-item {activeChat?.id === conv.id
                        ? 'active'
                        : ''}"
                    onclick={() => (activeChat = conv)}
                >
                    <div class="avatar-wrapper">
                        <Avatar name={conv.name} src={conv.avatar} size="md" />
                        <div
                            class="status-dot {socketService.onlineUsers[
                                conv.peerId
                            ] !== undefined
                                ? socketService.onlineUsers[conv.peerId]
                                    ? 'online'
                                    : ''
                                : conv.online
                                  ? 'online'
                                  : ''}"
                        ></div>
                    </div>
                    <div class="conv-info">
                        <span class="name">{conv.name}</span>
                        {#if socketService.typingStatus[conv.id]}
                            <span class="typing-text">đang nhập...</span>
                        {:else}
                            <span class="last-msg">{conv.lastMsg}</span>
                        {/if}
                    </div>
                    {#if conv.unreadCount > 0}
                        <div class="unread-badge-end">
                            <Badge color="danger" size="sm">
                                {conv.unreadCount}
                            </Badge>
                        </div>
                    {/if}
                </button>
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
                            {#each suggestedUsers as user}
                                <div class="suggested-item">
                                    <Avatar
                                        name={(user.fullname ||
                                            user.username) ??
                                            "User"}
                                        src={user.avatar ?? undefined}
                                        size="sm"
                                    />
                                    <div class="suggested-info">
                                        <span class="name"
                                            >{user.fullname ||
                                                user.username}</span
                                        >
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
        border-right: 1px solid #2a2e36;
        display: flex;
        flex-direction: column;
        height: 100%;
        background: #1e222b;
    }
    .list-header {
        padding: 20px;
        color: white;
    }
    .list-header h2 {
        margin: 0 0 15px 0;
        font-size: 20px;
        font-weight: 600;
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
        padding: 15px 20px;
        width: 100%;
        border: none;
        background: transparent;
        color: white;
        cursor: pointer;
        transition: 0.2s;
        text-align: left;
    }
    .conv-item:hover,
    .conv-item.active {
        background: #2a2e36;
    }
    .avatar-wrapper {
        position: relative;
    }
    .unread-badge-end {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 10px;
    }

    .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2.5px solid #1e222b;
        background: #9ca3af;
        transition: background-color 0.3s ease;
    }
    .status-dot.online {
        background: #10b981;
    }
    .conv-info {
        flex: 1;
        overflow: hidden;
    }
    .conv-info .name {
        display: block;
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
        font-family: Poppins;
    }
    .conv-info .last-msg {
        font-size: 13px;
        color: #9ca3af;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        font-family: Poppins;
    }
    .typing-text {
        color: #10b981;
        font-size: 12px;
        font-style: italic;
    }
    .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        min-height: 200px;
        color: #9ca3af;
    }
    /* === CSS MỚI CHO PHẦN EMPTY STATE === */
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
        color: #9ca3af;
        font-size: 14px;
        margin: 0 0 30px 0;
    }
    .suggested-section {
        text-align: left;
    }
    .suggested-section h4 {
        color: #d1d5db;
        font-size: 13px;
        font-weight: 600;
        margin: 0 0 15px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    .suggested-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .suggested-item {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #2a2e36;
        padding: 12px;
        border-radius: 12px;
        transition: background 0.2s;
    }
    .suggested-item:hover {
        background: #374151;
    }
    .suggested-info {
        flex: 1;
        overflow: hidden;
    }
    .suggested-info .name {
        display: block;
        color: white;
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
