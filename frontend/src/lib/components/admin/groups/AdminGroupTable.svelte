<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
    import type { AdminGroupApiItem } from "$lib/types/group.type";

    let {
        groups,
        loading = false,
        onView,
        onOpenChat,
    } = $props<{
        groups: AdminGroupApiItem[];
        loading?: boolean;
        onView?: (group: AdminGroupApiItem) => void;
        onOpenChat?: (group: AdminGroupApiItem) => void;
    }>();

    function formatDate(value?: string) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return date.toLocaleDateString();
    }

    function getGroupName(group: AdminGroupApiItem) {
        return group.name || "Unnamed Group";
    }

    function getScope(group: AdminGroupApiItem) {
        return (group.scope || "GENERAL").replaceAll("_", " ");
    }

    function getContext(group: AdminGroupApiItem) {
        if (group.Topic?.name && group.Challenge?.title) {
            return `${group.Topic.name} · ${group.Challenge.title}`;
        }

        if (group.Topic?.name) {
            return group.Topic.name;
        }

        if (group.Challenge?.title) {
            return group.Challenge.title;
        }

        return "No context";
    }

    function getLatestMessage(group: AdminGroupApiItem) {
        const latest = group.latestMsg;

        if (!latest) return "No messages yet";

        if (latest.content && latest.content.trim() !== "") {
            return latest.content;
        }

        if (latest.Attachment && latest.Attachment.length > 0) {
            return "Sent an attachment";
        }

        return "No messages yet";
    }

    function scopeColor(scope?: string) {
        if (scope === "GENERAL") return "outline";
        if (scope === "TOPIC_DISCUSSION") return "info";
        if (scope === "CHALLENGE_HELP") return "warning";
        if (scope === "STUDY_GROUP") return "success";
        return "outline";
    }
</script>

<section class="table-panel">
    {#if loading}
        <div class="empty-state">
            <Loading size="md" message="Loading groups..." />
        </div>
    {:else if groups.length === 0}
        <div class="empty-state">
            <div class="empty-icon">💬</div>
            <p>No groups found</p>
            <span>Create the first group for users to discover and join.</span>
        </div>
    {:else}
        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Scope</th>
                        <th>Context</th>
                        <th>Members</th>
                        <th>Last Message</th>
                        <th>Created</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {#each groups as group (group.conversationId || group.id)}
                        <tr>
                            <td>
                                <div class="group-cell">
                                    <Avatar
                                        name={getGroupName(group)}
                                        src={group.avatar ?? undefined}
                                        size="sm"
                                    />

                                    <div class="group-meta">
                                        <div class="group-name">
                                            {getGroupName(group)}
                                        </div>

                                        <div class="group-id">
                                            {group.conversationId || group.id}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td>
                                <Badge
                                    color={scopeColor(group.scope)}
                                    size="sm"
                                >
                                    {getScope(group)}
                                </Badge>
                            </td>

                            <td>
                                <span class="context-value">
                                    {getContext(group)}
                                </span>
                            </td>

                            <td>
                                <strong class="member-value">
                                    {group.memberCount || 0}
                                </strong>
                            </td>

                            <td>
                                <span class="last-msg">
                                    {getLatestMessage(group)}
                                </span>
                            </td>

                            <td>{formatDate(group.created_at)}</td>

                            <td>
                                <div class="actions">
                                    <button
                                        type="button"
                                        class="icon-btn"
                                        aria-label={`View group ${getGroupName(group)}`}
                                        title="View group"
                                        onclick={() => onView?.(group)}
                                    >
                                        <Icon name="pencil" size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        class="icon-btn"
                                        aria-label={`Open chat ${getGroupName(group)}`}
                                        title="Open chat"
                                        onclick={() => onOpenChat?.(group)}
                                    >
                                        <Icon name="message-circle" size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</section>

<style>
    .table-panel {
        background: #181b22;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
        overflow: hidden;
    }

    .table-scroll {
        overflow-x: auto;
        scrollbar-color: #2a2e36 #111318;
        scrollbar-width: thin;
    }

    .table-scroll::-webkit-scrollbar {
        height: 10px;
    }

    .table-scroll::-webkit-scrollbar-track {
        background: #111318;
        border-radius: 999px;
    }

    .table-scroll::-webkit-scrollbar-thumb {
        background: #2a2e36;
        border-radius: 999px;
        border: 2px solid #111318;
    }

    .table-scroll::-webkit-scrollbar-thumb:hover {
        background: #3a3f4c;
    }

    table {
        width: 100%;
        min-width: 1060px;
        border-collapse: collapse;
    }

    thead {
        background: #20232b;
    }

    th,
    td {
        padding: 15px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
        vertical-align: middle;
        font-size: 14px;
    }

    th {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
    }

    td {
        color: #d1d5db;
    }

    tbody tr {
        transition: background-color 0.2s ease;
    }

    tbody tr:hover {
        background: rgba(139, 92, 246, 0.06);
    }

    tbody tr:last-child td {
        border-bottom: none;
    }

    .text-right {
        text-align: right;
    }

    .group-cell {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 260px;
        max-width: 420px;
    }

    .group-meta {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .group-name {
        color: #ffffff;
        font-size: 14px;
        font-weight: 800;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .group-id {
        color: #9ca3af;
        font-size: 11px;
        line-height: 1.35;
        max-width: 260px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .context-value {
        display: block;
        max-width: 220px;
        color: #d1d5db;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .member-value {
        color: #ffffff;
        font-weight: 800;
    }

    .last-msg {
        display: block;
        max-width: 240px;
        color: #9ca3af;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .actions {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 8px;
    }

    .icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 11px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: #111318;
        color: #cbd5e1;
        cursor: pointer;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
    }

    .icon-btn:hover {
        background: rgba(139, 92, 246, 0.14);
        border-color: rgba(139, 92, 246, 0.32);
        color: #ffffff;
        transform: translateY(-1px);
    }

    .empty-state {
        padding: 48px 20px;
        text-align: center;
        color: #9ca3af;
    }

    .empty-state p {
        margin: 10px 0 4px;
        color: #ffffff;
        font-weight: 700;
    }

    .empty-state span {
        font-size: 14px;
    }

    .empty-icon {
        font-size: 36px;
    }
</style>
