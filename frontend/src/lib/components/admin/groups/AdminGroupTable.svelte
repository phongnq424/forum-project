<script lang="ts">
    import Avatar from "$lib/components/ui/Avatar.svelte";
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

<section class="adm-panel adm-table-panel">
    {#if loading}
        <div class="adm-empty-state">
            <Loading size="md" message="Loading groups..." />
        </div>
    {:else if groups.length === 0}
        <div class="adm-empty-state">
            <div class="adm-empty-icon">💬</div>
            <p>No groups found</p>
            <span>Create the first group for users to discover and join.</span>
        </div>
    {:else}
        <div class="adm-table-scroll">
            <table class="adm-table min-1060">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>Scope</th>
                        <th>Context</th>
                        <th>Members</th>
                        <th>Last Message</th>
                        <th>Created</th>
                        <th class="adm-text-right">Actions</th>
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
                                        <div class="adm-row-title group-name">
                                            {getGroupName(group)}
                                        </div>

                                        <div class="adm-row-subtle group-id">
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
                                <span class="adm-row-muted context-value">
                                    {getContext(group)}
                                </span>
                            </td>

                            <td>
                                <strong class="member-value">
                                    {group.memberCount || 0}
                                </strong>
                            </td>

                            <td>
                                <span class="adm-row-muted last-msg">
                                    {getLatestMessage(group)}
                                </span>
                            </td>

                            <td>{formatDate(group.created_at)}</td>

                            <td>
                                <div class="adm-row-actions">
                                    <button
                                        type="button"
                                        class="adm-icon-btn"
                                        aria-label={`View group ${getGroupName(group)}`}
                                        title="View group"
                                        onclick={() => onView?.(group)}
                                    >
                                        <Icon name="pencil" size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        class="adm-icon-btn"
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

    .group-name,
    .group-id,
    .context-value,
    .last-msg {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .group-id {
        max-width: 260px;
    }

    .context-value {
        display: block;
        max-width: 220px;
    }

    .last-msg {
        display: block;
        max-width: 240px;
    }

    .member-value {
        color: var(--adm-text-strong);
        font-weight: var(--adm-weight-semibold);
    }
</style>
