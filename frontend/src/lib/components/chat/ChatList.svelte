<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { socketService } from "$lib/services/socket.svelte";
    import { userService } from "$lib/services/user.service";
    import type { User } from "$lib/types/user.type";
    import { onMount } from "svelte";

    let { conversations, activeChat = $bindable() } = $props<{
        conversations: any[];
        activeChat: any;
    }>();

    let suggestedUsers = $state<User[]>([]);
    let searchQuery = $state("");
    let isSearching = $state(false);

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

    // Load data lần đầu khi mở app
    onMount(() => {
        loadSuggestedUsers();
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

    <div class="scroll-area">
        {#if conversations && conversations.length > 0}
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
                            class="status-dot {conv.online ? 'online' : ''}"
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
    </div>
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
    .scroll-area {
        overflow-y: auto;
        flex: 1;
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
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
    }
    .conv-info .last-msg {
        font-size: 12px;
        color: #9ca3af;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }
    .typing-text {
        color: #10b981;
        font-size: 12px;
        font-style: italic;
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
    .suggested-info .bio {
        display: block;
        color: #9ca3af;
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
