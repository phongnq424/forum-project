<script lang="ts">
    import { onMount } from "svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import { challengeService } from "$lib/services/challenge.service";
    import type { ConversationScope } from "$lib/types/chat-common.type";
    import type {
        AdminGroupApiItem,
        AdminUpdateGroupPayload,
    } from "$lib/types/group.type";

    type Topic = {
        id: string;
        name: string;
        slug?: string;
        parent_id?: string | null;
    };

    type Challenge = {
        id: string;
        title: string;
        difficulty?: string;
        type?: string;
    };

    type SelectOption = {
        value: string;
        label: string;
        disabled?: boolean;
    };

    let {
        group,
        loading = false,
        error = "",
        onUpdate,
        onDelete,
        onOpenChat,
        onClose,
    } = $props<{
        group: AdminGroupApiItem;
        loading?: boolean;
        error?: string;
        onUpdate?: (payload: AdminUpdateGroupPayload) => void;
        onDelete?: (group: AdminGroupApiItem) => void;
        onOpenChat?: (group: AdminGroupApiItem) => void;
        onClose?: () => void;
    }>();

    let editing = $state(false);

    let name = $state("");
    let avatar = $state("");
    let scope = $state<ConversationScope>("GENERAL");
    let topicId = $state("");
    let challengeId = $state("");

    let topics = $state<Topic[]>([]);
    let challenges = $state<Challenge[]>([]);

    let loadingTopics = $state(false);
    let loadingChallenges = $state(false);

    let topicError = $state("");
    let challengeError = $state("");

    const scopeOptions: SelectOption[] = [
        { value: "GENERAL", label: "General" },
        { value: "TOPIC_DISCUSSION", label: "Topic Discussion" },
        { value: "CHALLENGE_HELP", label: "Challenge Help" },
        { value: "STUDY_GROUP", label: "Study Group" },
        { value: "CLASS_GROUP", label: "Class Group" },
        { value: "AI_TUTOR", label: "AI Tutor" },
    ];

    let topicOptions = $derived<SelectOption[]>(
        topics.map((topic) => ({
            value: topic.id,
            label: topic.name,
        })),
    );

    let challengeOptions = $derived<SelectOption[]>(
        challenges.map((challenge) => ({
            value: challenge.id,
            label: `${challenge.title}${challenge.type ? ` · ${challenge.type}` : ""}`,
        })),
    );

    let showTopicSelect = $derived(
        scope === "TOPIC_DISCUSSION" ||
            scope === "STUDY_GROUP" ||
            scope === "AI_TUTOR",
    );

    let showChallengeSelect = $derived(
        scope === "CHALLENGE_HELP" ||
            scope === "STUDY_GROUP" ||
            scope === "AI_TUTOR",
    );

    let requireTopic = $derived(scope === "TOPIC_DISCUSSION");
    let requireChallenge = $derived(scope === "CHALLENGE_HELP");

    let canSave = $derived(
        !loading &&
            !loadingTopics &&
            !loadingChallenges &&
            name.trim() !== "" &&
            (!requireTopic || topicId !== "") &&
            (!requireChallenge || challengeId !== ""),
    );

    onMount(() => {
        resetFormFromGroup();
        loadTopics();
        loadChallenges();
    });

    $effect(() => {
        group;
        resetFormFromGroup();
    });

    $effect(() => {
        if (!editing) return;

        if (!showTopicSelect) {
            topicId = "";
        }

        if (!showChallengeSelect) {
            challengeId = "";
        }
    });

    async function loadTopics() {
        loadingTopics = true;
        topicError = "";

        try {
            const result = await adminTopicService.listTopics({
                page: 1,
                limit: 100,
            });

            topics = Array.isArray(result) ? result : result.data || [];
        } catch (e) {
            topicError =
                e instanceof Error ? e.message : "Failed to load topics";
            topics = [];
        } finally {
            loadingTopics = false;
        }
    }

    async function loadChallenges() {
        loadingChallenges = true;
        challengeError = "";

        try {
            const result = await challengeService.listChallenges({
                page: 1,
                limit: 100,
            });

            challenges = Array.isArray(result) ? result : result.data || [];
        } catch (e) {
            challengeError =
                e instanceof Error ? e.message : "Failed to load challenges";
            challenges = [];
        } finally {
            loadingChallenges = false;
        }
    }

    function resetFormFromGroup() {
        name = group.name || "";
        avatar = group.avatar || "";
        scope = group.scope || "GENERAL";
        topicId = group.topic_id || "";
        challengeId = group.challenge_id || "";
    }

    function getName() {
        return group.name || "Unnamed Group";
    }

    function getScopeLabel() {
        return (group.scope || "GENERAL").replaceAll("_", " ").toLowerCase();
    }

    function getContextLabel() {
        if (group.Topic?.name && group.Challenge?.title) {
            return `${group.Topic.name} · ${group.Challenge.title}`;
        }

        if (group.Topic?.name) {
            return group.Topic.name;
        }

        if (group.Challenge?.title) {
            return group.Challenge.title;
        }

        return "-";
    }

    function formatDate(value?: string) {
        if (!value) return "-";

        return new Date(value).toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function startEdit() {
        resetFormFromGroup();
        editing = true;
    }

    function cancelEdit() {
        resetFormFromGroup();
        editing = false;
    }

    function submitUpdate() {
        if (!canSave) return;

        onUpdate?.({
            name: name.trim(),
            avatar: avatar.trim() || null,
            scope,
            topic_id: topicId || null,
            challenge_id: challengeId || null,
        });

        editing = false;
    }
</script>

<div class="detail">
    <section class="header-row">
        <div class="summary">
            <Avatar
                name={getName()}
                src={group.avatar ?? undefined}
                size="md"
            />

            <div class="summary-text">
                <h3>{getName()}</h3>

                <p>
                    {getScopeLabel()} · {group.memberCount || 0} members
                </p>

                <span>{group.conversationId || group.id}</span>
            </div>
        </div>

        <div class="header-actions">
            {#if !editing}
                <Button
                    variant="secondary"
                    disabled={loading}
                    onclick={startEdit}
                >
                    <Icon name="pencil" size={15} />
                    Edit
                </Button>
            {:else}
                <Button
                    variant="secondary"
                    disabled={loading}
                    onclick={cancelEdit}
                >
                    Cancel Edit
                </Button>
            {/if}
        </div>
    </section>

    {#if error}
        <div class="alert error">{error}</div>
    {/if}

    {#if editing}
        <form
            class="edit-form"
            onsubmit={(event) => {
                event.preventDefault();
                submitUpdate();
            }}
        >
            <div class="field-row">
                <Select
                    bind:value={scope}
                    label="Scope"
                    placeholder="Select scope"
                    options={scopeOptions}
                    disabled={loading}
                />
            </div>

            {#if showTopicSelect}
                <div class="field-row">
                    {#if loadingTopics}
                        <div class="field-loading">
                            <Loading size="sm" message="Loading topics..." />
                        </div>
                    {:else}
                        <Select
                            bind:value={topicId}
                            label={requireTopic ? "Topic" : "Topic optional"}
                            placeholder="Select a topic"
                            options={topicOptions}
                            disabled={loading || loadingTopics}
                        />
                    {/if}

                    {#if topicError}
                        <p class="field-error">{topicError}</p>
                    {/if}
                </div>
            {/if}

            {#if showChallengeSelect}
                <div class="field-row">
                    {#if loadingChallenges}
                        <div class="field-loading">
                            <Loading
                                size="sm"
                                message="Loading challenges..."
                            />
                        </div>
                    {:else}
                        <Select
                            bind:value={challengeId}
                            label={requireChallenge
                                ? "Challenge"
                                : "Challenge optional"}
                            placeholder="Select a challenge"
                            options={challengeOptions}
                            disabled={loading || loadingChallenges}
                        />
                    {/if}

                    {#if challengeError}
                        <p class="field-error">{challengeError}</p>
                    {/if}
                </div>
            {/if}

            <div class="field-row">
                <span class="label">Group name</span>

                <Input
                    bind:value={name}
                    placeholder="Group name"
                    aria-label="Group name"
                />
            </div>

            <div class="field-row">
                <span class="label">Avatar URL optional</span>

                <Input
                    bind:value={avatar}
                    placeholder="https://..."
                    aria-label="Avatar URL optional"
                />
            </div>

            <div class="edit-actions">
                <Button
                    type="button"
                    variant="secondary"
                    disabled={loading}
                    onclick={cancelEdit}
                >
                    Cancel
                </Button>

                <Button type="submit" variant="primary" disabled={!canSave}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    {:else}
        <section class="info-grid">
            <div class="info-item">
                <span>Type</span>
                <strong>{group.type || "GROUP"}</strong>
            </div>

            <div class="info-item">
                <span>Scope</span>
                <strong>{getScopeLabel()}</strong>
            </div>

            <div class="info-item">
                <span>Context</span>
                <strong>{getContextLabel()}</strong>
            </div>

            <div class="info-item">
                <span>Created</span>
                <strong>{formatDate(group.created_at)}</strong>
            </div>

            <div class="info-item">
                <span>Updated</span>
                <strong>{formatDate(group.updated_at)}</strong>
            </div>
        </section>

        <section class="latest">
            <h4>Latest Message</h4>

            <p>{group.latestMsg?.content || "No messages yet"}</p>
        </section>
    {/if}

    <section class="members">
        <div class="section-title">
            <h4>Members</h4>
            <span>{group.members?.length || group.memberCount || 0}</span>
        </div>

        {#if group.members && group.members.length > 0}
            <div class="member-list">
                {#each group.members as member (member.id)}
                    <div class="member-item">
                        <Avatar
                            name={member.fullname || member.username || "User"}
                            src={member.avatar ?? undefined}
                            size="sm"
                        />

                        <div class="member-meta">
                            <strong>
                                {member.fullname || member.username || "User"}
                            </strong>

                            <span>{member.username || member.id}</span>
                        </div>

                        <div class="role-pill">
                            {member.role || "MEMBER"}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="empty-members">
                No member details returned from backend.
            </div>
        {/if}
    </section>

    <div class="actions">
        <Button variant="secondary" disabled={loading} onclick={onClose}>
            Close
        </Button>

        <Button
            variant="secondary"
            disabled={loading}
            onclick={() => onOpenChat?.(group)}
        >
            <Icon name="message-circle" size={16} />
            Open Chat
        </Button>

        <Button
            variant="danger"
            disabled={loading}
            onclick={() => onDelete?.(group)}
        >
            Delete Group
        </Button>
    </div>
</div>

<style>
    .detail {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    .header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    }

    .summary {
        display: flex;
        align-items: center;
        gap: 14px;
        min-width: 0;
    }

    .summary-text {
        min-width: 0;
    }

    .summary-text h3 {
        margin: 0 0 4px;
        color: #f8fafc;
        font-size: 18px;
        font-weight: 700;
    }

    .summary-text p {
        margin: 0 0 4px;
        color: #94a3b8;
        font-size: 13px;
        text-transform: capitalize;
    }

    .summary-text span {
        display: block;
        color: #64748b;
        font-size: 11px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .header-actions {
        flex-shrink: 0;
    }

    .alert {
        padding: 12px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.5;
    }

    .alert.error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border: 1px solid rgba(239, 68, 68, 0.22);
    }

    .edit-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding-bottom: 14px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.14);
    }

    .field-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .label {
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 600;
    }

    .field-loading {
        min-height: 42px;
        display: flex;
        align-items: center;
    }

    .field-error {
        margin: 0;
        color: #fca5a5;
        font-size: 12px;
    }

    .edit-actions,
    .actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex-wrap: wrap;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
    }

    .info-item {
        padding: 12px 0;
        min-width: 0;
    }

    .info-item span {
        display: block;
        margin-bottom: 6px;
        color: #94a3b8;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
    }

    .info-item strong {
        display: block;
        color: #f8fafc;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-transform: capitalize;
    }

    .latest,
    .members {
        padding-top: 14px;
        border-top: 1px solid rgba(148, 163, 184, 0.14);
    }

    .latest h4,
    .section-title h4 {
        margin: 0;
        color: #f8fafc;
        font-size: 14px;
        font-weight: 700;
    }

    .latest p {
        margin: 10px 0 0;
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.5;
    }

    .section-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
    }

    .section-title span {
        color: #94a3b8;
        font-size: 12px;
    }

    .member-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 260px;
        overflow: auto;
    }

    .member-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
    }

    .member-item:last-child {
        border-bottom: none;
    }

    .member-meta {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .member-meta strong {
        color: #f8fafc;
        font-size: 13px;
    }

    .member-meta span {
        color: #94a3b8;
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .role-pill {
        border-radius: 999px;
        padding: 4px 8px;
        background: rgba(99, 102, 241, 0.12);
        color: #a5b4fc;
        font-size: 10px;
        font-weight: 700;
    }

    .empty-members {
        color: #94a3b8;
        font-size: 13px;
        padding: 14px 0;
    }

    @media (max-width: 780px) {
        .header-row {
            align-items: flex-start;
            flex-direction: column;
        }

        .info-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .actions,
        .edit-actions {
            justify-content: stretch;
        }
    }

    @media (max-width: 520px) {
        .info-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
