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
    import type { PublicGroupApiItem } from "$lib/types/group.type";

    type SidebarMode = "chats" | "discover";

    let {
        conversations,
        publicGroups = [],
        activeChat = $bindable(),
        sidebarMode = $bindable<SidebarMode>(),
        publicGroupSearch = $bindable(),
        isLoading = true,
        isLoadingPublicGroups = false,
        joiningGroupId = null,
        onSelectConversation,
        onJoinGroup,
        onOpenJoinedGroup,
    } = $props<{
        conversations: ChatConversation[];
        publicGroups?: PublicGroupApiItem[];
        activeChat: ChatConversation | null;
        sidebarMode: SidebarMode;
        publicGroupSearch: string;
        isLoading: boolean;
        isLoadingPublicGroups?: boolean;
        joiningGroupId?: string | null;
        onSelectConversation?: (chat: ChatConversation) => void;
        onJoinGroup?: (group: PublicGroupApiItem) => void;
        onOpenJoinedGroup?: (group: PublicGroupApiItem) => void;
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
            console.error("Error loading users:", error);
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

    function selectConversation(conv: ChatConversation) {
        activeChat = conv;
        onSelectConversation?.(conv);
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

    function getGroupId(group: PublicGroupApiItem) {
        return group.conversationId || group.id || "";
    }

    function getGroupName(group: PublicGroupApiItem) {
        return group.name || "Unnamed Group";
    }

    function getGroupSubtitle(group: PublicGroupApiItem) {
        const scope = (group.scope || "GENERAL")
            .replaceAll("_", " ")
            .toLowerCase();

        const count = group.memberCount || 0;

        return `${scope} · ${count} members`;
    }

    function getGroupPreview(group: PublicGroupApiItem) {
        const latest = group.latestMsg;

        if (latest?.content && latest.content.trim() !== "") {
            return latest.content;
        }

        return group.joined
            ? "You are already in this group"
            : "Join this public group";
    }
</script>

<aside class="conv-list">
    <div class="list-header">
        <h2>Messages</h2>

        <div class="sidebar-tabs">
            <button
                type="button"
                class:active={sidebarMode === "chats"}
                onclick={() => (sidebarMode = "chats")}
            >
                My Chats
            </button>

            <button
                type="button"
                class:active={sidebarMode === "discover"}
                onclick={() => (sidebarMode = "discover")}
            >
                Discover
            </button>
        </div>

        {#if sidebarMode === "chats"}
            <div class="search-box">
                <Input bind:value={searchQuery} placeholder="Search users...">
                    {#snippet icon()}
                        <Icon name="search" size={18} />
                    {/snippet}
                </Input>
            </div>
        {:else}
            <div class="search-box">
                <Input
                    bind:value={publicGroupSearch}
                    placeholder="Search public groups..."
                >
                    {#snippet icon()}
                        <Icon name="search" size={18} />
                    {/snippet}
                </Input>
            </div>
        {/if}
    </div>

    <ScrollArea class="conversations-list">
        {#if sidebarMode === "chats"}
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
                        onclick={() => selectConversation(conv)}
                    >
                        <div class="avatar-wrapper">
                            <Avatar
                                name={conv.name}
                                src={conv.avatar}
                                size="md"
                            />

                            {#if conv.type === "CHAT"}
                                <div
                                    class="status-dot {getOnlineStatus(conv)
                                        ? 'online'
                                        : ''}"
                                ></div>
                            {:else}
                                <div class="group-dot">
                                    <Icon name="user" size={10} />
                                </div>
                            {/if}
                        </div>

                        <div class="conv-info">
                            <div class="name-row">
                                <span class="name">{conv.name}</span>

                                {#if conv.type === "GROUP"}
                                    <span class="type-pill">Group</span>
                                {/if}
                            </div>

                            {#if socketService.typingStatus[conv.id]}
                                <span class="typing-text">typing...</span>
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
        {:else if isLoadingPublicGroups}
            <div class="loading-state">
                <Loading size="md" message="Loading public groups..." />
            </div>
        {:else if publicGroups.length > 0}
            <div class="discover-list">
                {#each publicGroups as group (getGroupId(group))}
                    <div class="discover-item">
                        <div class="avatar-wrapper">
                            <Avatar
                                name={getGroupName(group)}
                                src={group.avatar ?? undefined}
                                size="md"
                            />

                            <div class="group-dot">
                                <Icon name="user" size={10} />
                            </div>
                        </div>

                        <div class="conv-info">
                            <div class="name-row">
                                <span class="name">
                                    {getGroupName(group)}
                                </span>

                                {#if group.joined}
                                    <span class="joined-pill">Joined</span>
                                {/if}
                            </div>

                            <span class="last-msg">
                                {getGroupSubtitle(group)}
                            </span>

                            <span class="group-preview">
                                {getGroupPreview(group)}
                            </span>
                        </div>

                        {#if group.joined}
                            <Button
                                variant="secondary"
                                size="sm"
                                onclick={() => onOpenJoinedGroup?.(group)}
                            >
                                Open
                            </Button>
                        {:else}
                            <Button
                                variant="primary"
                                size="sm"
                                disabled={joiningGroupId === getGroupId(group)}
                                onclick={() => onJoinGroup?.(group)}
                            >
                                {joiningGroupId === getGroupId(group)
                                    ? "Joining..."
                                    : "Join"}
                            </Button>
                        {/if}
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-state-list">
                <div class="empty-icon">
                    <Icon name="folder" size={32} />
                </div>

                <p class="empty-text">No public groups found</p>
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

    .sidebar-tabs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        padding: 4px;
        border-radius: 12px;
        background: #10131a;
        margin-bottom: 14px;
    }

    .sidebar-tabs button {
        font-family: "Poppins";
        border: none;
        border-radius: 9px;
        padding: 8px 10px;
        cursor: pointer;
        background: transparent;
        color: #8b949e;
        font-size: 12px;
        font-weight: 600;
    }

    .sidebar-tabs button.active {
        background: #252a33;
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

    .conv-item,
    .discover-item {
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
        box-sizing: border-box;
    }

    .discover-item {
        cursor: default;
    }

    .conv-item:hover,
    .discover-item:hover {
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

    .group-dot {
        position: absolute;
        bottom: -2px;
        right: -2px;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        border: 2px solid #171a21;
        background: #6366f1;
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 800;
        line-height: 1;
        font-family: "Poppins";
    }

    .conv-info {
        flex: 1;
        overflow: hidden;
        min-width: 0;
    }

    .name-row {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        margin-bottom: 3px;
    }

    .conv-info .name,
    .suggested-info .name {
        display: block;
        font-weight: 500;
        font-size: 13px;
        line-height: 1.35;
        color: #f3f4f6;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: "Poppins";
    }

    .type-pill,
    .joined-pill {
        flex-shrink: 0;
        border-radius: 999px;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 600;
        font-family: "Poppins";
        background: rgba(99, 102, 241, 0.14);
        color: #a5b4fc;
    }

    .joined-pill {
        background: rgba(34, 197, 94, 0.12);
        color: #86efac;
    }

    .conv-info .last-msg,
    .group-preview {
        font-family: "Poppins";
        font-size: 12px;
        line-height: 1.35;
        color: #8b949e;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
    }

    .group-preview {
        margin-top: 3px;
        color: #6b7280;
    }

    .typing-text {
        color: #22c55e;
        font-size: 12px;
        font-style: italic;
        font-family: "Poppins";
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
        font-family: "Poppins";
        margin: 0 0 30px 0;
    }

    .suggested-section {
        text-align: left;
    }

    .suggested-section h4 {
        color: #d1d5db;
        font-size: 12px;
        font-family: "Poppins";
        font-weight: 600;
        margin: 0 0 14px 0;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .suggested-list,
    .discover-list {
        display: flex;
        flex-direction: column;
    }

    .suggested-list {
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
</style>
