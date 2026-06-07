<script lang="ts">
    import { onMount } from "svelte";
    import type { ComponentProps } from "svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import { notificationService } from "$lib/services/notification.service";
    import type { NotificationItem } from "$lib/types/notification.type";

    type IconName = ComponentProps<typeof Icon>["name"];

    type Props = {
        closeOthers?: () => void;
    };

    type FilterType = "all" | "unread";

    type NotificationViewItem = {
        id: string;
        title: string;
        message: string;
        link: string | null;
        avatarUrl: string | null;
        timeText: string;
        isRead: boolean;
        type: string;
        typeIcon: IconName;
        typeClass: string;
    };

    let { closeOthers }: Props = $props();

    let rootEl = $state<HTMLElement | null>(null);
    let isOpen = $state(false);
    let notifications = $state<NotificationItem[]>([]);
    let unreadCount = $state(0);
    let loading = $state(false);
    let activeFilter = $state<FilterType>("all");

    function getNotificationType(item: NotificationItem) {
        return String(item.type || "SYSTEM");
    }

    function getNotificationTypeIcon(type: string): IconName {
        switch (type) {
            case "POST_COMMENT":
            case "MESSAGE":
                return "message-square";
            case "COMMENT_REPLY":
            case "MENTION":
                return "reply";
            case "POST_REACTION":
            case "COMMENT_REACTION":
                return "heart";
            case "FOLLOW":
                return "user";
            case "POST_ACTIVITY":
                return "folder";
            case "POST_BOOKMARK":
            case "POST_MODERATION":
            case "ACHIEVEMENT":
            case "SYSTEM":
            default:
                return "bell";
        }
    }

    function getNotificationTypeClass(type: string) {
        switch (type) {
            case "POST_COMMENT":
            case "COMMENT_REPLY":
            case "MESSAGE":
                return "type-message";
            case "POST_REACTION":
            case "COMMENT_REACTION":
                return "type-reaction";
            case "FOLLOW":
                return "type-follow";
            case "POST_BOOKMARK":
                return "type-bookmark";
            case "POST_MODERATION":
                return "type-moderation";
            case "ACHIEVEMENT":
                return "type-achievement";
            case "MENTION":
                return "type-mention";
            case "SYSTEM":
            default:
                return "type-system";
        }
    }

    function getNotificationTitle(item: NotificationItem) {
        return item.title || item.type || "Notification";
    }

    function getNotificationMessage(item: NotificationItem) {
        return item.message || item.content || "";
    }

    function getNotificationLink(item: NotificationItem) {
        return item.link || item.url || null;
    }

    function getAvatarUrl(item: NotificationItem) {
        const raw = item as any;

        return (
            raw.avatarUrl ||
            raw.avatar_url ||
            raw.actor?.avatar ||
            raw.Actor?.avatar ||
            raw.actor_avatar ||
            raw.actorAvatar ||
            raw.sender_avatar ||
            raw.senderAvatar ||
            raw.user_avatar ||
            raw.userAvatar ||
            raw.avatar ||
            null
        );
    }

    function formatNotificationTime(value: string) {
        const date = new Date(value);
        const diff = Date.now() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        const weeks = Math.floor(diff / 604800000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return `${weeks}w ago`;
    }

    function toViewItem(item: NotificationItem): NotificationViewItem {
        const type = getNotificationType(item);

        return {
            id: item.id,
            title: getNotificationTitle(item),
            message: getNotificationMessage(item),
            link: getNotificationLink(item),
            avatarUrl: getAvatarUrl(item),
            timeText: formatNotificationTime(item.created_at),
            isRead: item.is_read,
            type,
            typeIcon: getNotificationTypeIcon(type),
            typeClass: getNotificationTypeClass(type),
        };
    }

    let viewItems = $derived(notifications.map(toViewItem));

    let visibleNotifications = $derived(
        activeFilter === "unread"
            ? viewItems.filter((item) => !item.isRead)
            : viewItems,
    );

    function handleWindowClick(event: MouseEvent) {
        if (!isOpen || !rootEl) return;

        const target = event.target as Node;

        if (!rootEl.contains(target)) {
            isOpen = false;
        }
    }

    function handleEscape(event: KeyboardEvent) {
        if (event.key === "Escape") {
            isOpen = false;
        }
    }

    async function loadNotifications() {
        loading = true;

        try {
            const [listRes, countRes] = await Promise.all([
                notificationService.list({
                    page: 1,
                    limit: 15,
                }),
                notificationService.unreadCount(),
            ]);

            notifications = listRes.data;
            unreadCount = countRes.unreadCount;
        } catch (error) {
            console.error("Load notifications failed:", error);
        } finally {
            loading = false;
        }
    }

    async function togglePanel(event: MouseEvent) {
        event.stopPropagation();

        closeOthers?.();

        isOpen = !isOpen;

        if (isOpen) {
            await loadNotifications();
        }
    }

    function changeFilter(filter: FilterType) {
        activeFilter = filter;
    }

    async function handleNotificationClick(item: NotificationViewItem) {
        try {
            if (!item.isRead) {
                await notificationService.markRead(item.id);

                notifications = notifications.map((notification) => {
                    if (notification.id === item.id) {
                        return {
                            ...notification,
                            is_read: true,
                        };
                    }

                    return notification;
                });

                unreadCount = Math.max(0, unreadCount - 1);
            }

            isOpen = false;

            if (item.link) {
                window.location.href = item.link;
            }
        } catch (error) {
            console.error("Mark notification read failed:", error);
        }
    }

    async function handleMarkAllRead(event: MouseEvent) {
        event.stopPropagation();

        if (unreadCount <= 0) return;

        try {
            await notificationService.markAllRead();

            notifications = notifications.map((notification) => ({
                ...notification,
                is_read: true,
            }));

            unreadCount = 0;
        } catch (error) {
            console.error("Mark all notifications failed:", error);
        }
    }

    onMount(() => {
        loadNotifications();
    });
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleEscape} />

<div class="notification-root" bind:this={rootEl}>
    <button
        class="bell-button"
        class:active={isOpen}
        type="button"
        aria-label={`${unreadCount} unread notifications`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onclick={togglePanel}
    >
        <Icon name="bell" size={21} />

        {#if unreadCount > 0}
            <span class="bell-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
            </span>
        {/if}
    </button>

    {#if isOpen}
        <div
            class="notification-panel"
            role="dialog"
            aria-label="Notifications"
        >
            <div class="panel-accent"></div>

            <header class="panel-header">
                <div class="panel-title">
                    <h2>Notifications</h2>
                    <p>
                        {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "No unread notifications"}
                    </p>
                </div>
            </header>

            <div class="panel-actions">
                <div
                    class="filter-group"
                    role="tablist"
                    aria-label="Notification filters"
                >
                    <button
                        class="filter-button"
                        class:active={activeFilter === "all"}
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === "all"}
                        onclick={() => changeFilter("all")}
                    >
                        All
                    </button>

                    <button
                        class="filter-button"
                        class:active={activeFilter === "unread"}
                        type="button"
                        role="tab"
                        aria-selected={activeFilter === "unread"}
                        onclick={() => changeFilter("unread")}
                    >
                        Unread
                    </button>
                </div>

                {#if unreadCount > 0}
                    <button
                        class="mark-read-button"
                        type="button"
                        onclick={handleMarkAllRead}
                    >
                        Mark all read
                    </button>
                {:else}
                    <a
                        class="mark-read-button"
                        href="/notifications"
                        onclick={() => (isOpen = false)}
                    >
                        View all
                    </a>
                {/if}
            </div>

            <div class="section-label">Earlier</div>

            {#if loading}
                <div class="state-view">
                    <div class="loader"></div>
                    <span>Loading notifications...</span>
                </div>
            {:else if visibleNotifications.length === 0}
                <div class="state-view empty">
                    <div class="empty-avatar">
                        <Icon name="bell" size={20} />
                    </div>
                    <strong>No notifications</strong>
                    <span>New activity will appear here.</span>
                </div>
            {:else}
                <div class="notification-list">
                    {#each visibleNotifications as item}
                        <button
                            class="notification-item"
                            class:unread={!item.isRead}
                            type="button"
                            onclick={() => handleNotificationClick(item)}
                        >
                            <div class="avatar-wrap">
                                <div class="avatar">
                                    {#if item.avatarUrl}
                                        <img src={item.avatarUrl} alt="" />
                                    {:else}
                                        <Icon name="user" size={22} />
                                    {/if}
                                </div>

                                <span class={`type-badge ${item.typeClass}`}>
                                    <Icon name={item.typeIcon} size={11} />
                                </span>
                            </div>

                            <div class="item-content">
                                <div class="item-title">
                                    {item.title}
                                </div>

                                {#if item.message}
                                    <div class="item-message">
                                        {item.message}
                                    </div>
                                {/if}

                                <div class="item-time">
                                    {item.timeText}
                                </div>
                            </div>

                            <div class="item-status">
                                {#if !item.isRead}
                                    <span></span>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
    .notification-root {
        position: relative;
        display: flex;
        align-items: center;
    }

    :where(button, a) {
        font: inherit;
    }

    .bell-button {
        position: relative;
        width: 40px;
        height: 40px;
        padding: 0;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: #cbd5e1;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition:
            background 0.16s ease,
            color 0.16s ease,
            transform 0.16s ease;
    }

    .bell-button:hover,
    .bell-button.active {
        background: rgba(255, 255, 255, 0.06);
        color: #ffffff;
        transform: translateY(-1px);
    }

    .bell-badge {
        position: absolute;
        top: 2px;
        right: 2px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        background: #ef4444;
        color: #ffffff;
        border: 2px solid #282828;
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(34%, -28%);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
    }

    .notification-panel {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        z-index: 120;
        width: 390px;
        max-height: 560px;
        overflow: hidden;
        border-radius: 16px;
        background: linear-gradient(
                180deg,
                rgba(139, 92, 246, 0.08),
                rgba(139, 92, 246, 0) 118px
            ),
            #242529;
        color: #e5e7eb;
        border: 1px solid rgba(139, 92, 246, 0.16);
        box-shadow: 0 22px 60px rgba(0, 0, 0, 0.48);
    }

    .panel-accent {
        height: 2px;
        background: linear-gradient(
            90deg,
            rgba(139, 92, 246, 0.95),
            rgba(139, 92, 246, 0.18)
        );
    }

    .panel-header {
        padding: 16px 18px 8px;
    }

    .panel-title h2 {
        margin: 0;
        color: #f9fafb;
        font-size: 18px;
        line-height: 1.25;
        font-weight: 600;
        letter-spacing: 0;
    }

    .panel-title p {
        margin: 4px 0 0;
        color: #9ca3af;
        font-size: 12px;
        line-height: 1.3;
        font-weight: 400;
    }

    .panel-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 6px 18px 10px;
    }

    .filter-group {
        display: inline-flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
        flex: 0 0 auto;
    }

    .filter-button {
        padding: 0;
        border: 0;
        background: transparent;
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.35;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
        position: relative;
        transition: color 0.16s ease;
    }

    .filter-button:hover {
        color: #d7dbe4;
    }

    .filter-button.active {
        color: #efeaff;
        font-weight: 650;
    }

    .filter-button.active::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: -6px;
        height: 2px;
        border-radius: 999px;
        background: #8b5cf6;
    }

    .mark-read-button {
        padding: 0;
        border: 0;
        background: transparent;
        color: #9ca3af;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.35;
        text-decoration: none;
        cursor: pointer;
        white-space: nowrap;
        flex: 0 0 auto;
        transition: color 0.16s ease;
    }

    .mark-read-button:hover {
        color: #c4b5fd;
    }

    .section-label {
        padding: 0 18px 4px;
        color: #8f95a3;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.25;
    }

    .notification-list {
        max-height: 400px;
        overflow-y: auto;
        padding: 4px 8px 10px;
    }

    .notification-list::-webkit-scrollbar {
        width: 7px;
    }

    .notification-list::-webkit-scrollbar-track {
        background: transparent;
    }

    .notification-list::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.34);
        border-radius: 999px;
    }

    .notification-list::-webkit-scrollbar-thumb:hover {
        background: rgba(148, 163, 184, 0.48);
    }

    .notification-item {
        width: 100%;
        min-width: 0;
        padding: 9px 10px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: inherit;
        cursor: pointer;
        display: grid;
        grid-template-columns: 46px minmax(0, 1fr) 12px;
        gap: 10px;
        text-align: left;
        transition:
            background 0.16s ease,
            opacity 0.16s ease;
    }

    .notification-item:hover {
        background: rgba(255, 255, 255, 0.055);
    }

    .notification-item:not(.unread) {
        opacity: 0.58;
    }

    .notification-item:not(.unread):hover {
        opacity: 0.84;
    }

    .notification-item.unread {
        opacity: 1;
    }

    .avatar-wrap {
        position: relative;
        width: 46px;
        height: 46px;
        flex-shrink: 0;
    }

    .avatar {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: #34363d;
        color: #cfd2dc;
        border: 1px solid rgba(255, 255, 255, 0.09);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .notification-item.unread .avatar {
        border-color: rgba(139, 92, 246, 0.32);
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.08);
    }

    .avatar img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
    }

    .type-badge {
        position: absolute;
        right: -2px;
        bottom: -2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 2px solid #242529;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .type-message {
        background: #3b82f6;
    }

    .type-reaction {
        background: #ef4444;
    }

    .type-follow {
        background: #22c55e;
    }

    .type-bookmark {
        background: #f59e0b;
    }

    .type-moderation {
        background: #8b5cf6;
    }

    .type-achievement {
        background: #eab308;
    }

    .type-mention {
        background: #06b6d4;
    }

    .type-system {
        background: #64748b;
    }

    .item-content {
        min-width: 0;
    }

    .item-title {
        color: #d8dbe2;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.35;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .notification-item.unread .item-title {
        color: #ffffff;
        font-weight: 600;
    }

    .item-message {
        margin-top: 2px;
        color: #9ca3af;
        font-size: 13px;
        font-weight: 400;
        line-height: 1.35;
        display: -webkit-box;
        line-clamp: 2;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .notification-item.unread .item-message {
        color: #c6c9d1;
    }

    .item-time {
        margin-top: 4px;
        color: #7c8290;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.2;
    }

    .notification-item.unread .item-time {
        color: #a78bfa;
    }

    .item-status {
        width: 12px;
        height: 46px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .item-status span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #8b5cf6;
        display: block;
    }

    .state-view {
        min-height: 210px;
        padding: 34px 20px 42px;
        color: #9ca3af;
        font-size: 13px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .state-view.empty strong {
        color: #f4f4f5;
        font-size: 14px;
        font-weight: 500;
    }

    .state-view.empty span {
        color: #9ca3af;
        font-size: 12px;
    }

    .empty-avatar {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.06);
        color: #a1a1aa;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .loader {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid rgba(255, 255, 255, 0.1);
        border-top-color: #a78bfa;
        animation: notification-spin 0.8s linear infinite;
    }

    @keyframes notification-spin {
        to {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 600px) {
        .notification-panel {
            width: min(370px, calc(100vw - 24px));
            right: -6px;
            border-radius: 16px;
        }

        .panel-title h2 {
            font-size: 18px;
        }

        .panel-actions {
            padding-inline: 16px;
        }

        .section-label {
            padding-inline: 16px;
        }

        .notification-list {
            max-height: 380px;
        }

        .notification-item {
            grid-template-columns: 44px minmax(0, 1fr) 10px;
            gap: 9px;
            padding: 8px 9px;
        }

        .avatar-wrap,
        .avatar {
            width: 44px;
            height: 44px;
        }

        .type-badge {
            width: 17px;
            height: 17px;
        }

        .item-status {
            height: 44px;
        }
    }
</style>
