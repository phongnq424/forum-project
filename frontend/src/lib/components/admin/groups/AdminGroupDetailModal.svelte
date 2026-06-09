<script lang="ts">
    import { onMount } from "svelte";
    import Avatar from "$lib/components/ui/Avatar.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Badge from "$lib/components/ui/Badge.svelte";
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

<div class="adm-detail">
    <section class="adm-detail-header">
        <div class="adm-summary-row">
            <Avatar
                name={getName()}
                src={group.avatar ?? undefined}
                size="md"
            />

            <div class="adm-summary-text">
                <h3 class="adm-summary-title">{getName()}</h3>

                <p class="adm-summary-description">
                    {getScopeLabel()} · {group.memberCount || 0} members
                </p>

                <span class="adm-summary-id">
                    {group.conversationId || group.id}
                </span>
            </div>
        </div>

        <div class="adm-header-actions">
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
        <div class="adm-alert-error">{error}</div>
    {/if}

    {#if editing}
        <form
            class="adm-form"
            onsubmit={(event) => {
                event.preventDefault();
                submitUpdate();
            }}
        >
            <Select
                bind:value={scope}
                label="Scope"
                placeholder="Select scope"
                options={scopeOptions}
                disabled={loading}
            />

            {#if showTopicSelect}
                <div class="adm-form-group">
                    {#if loadingTopics}
                        <div class="adm-field-loading">
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
                        <p class="adm-field-error">{topicError}</p>
                    {/if}
                </div>
            {/if}

            {#if showChallengeSelect}
                <div class="adm-form-group">
                    {#if loadingChallenges}
                        <div class="adm-field-loading">
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
                        <p class="adm-field-error">{challengeError}</p>
                    {/if}
                </div>
            {/if}

            <div class="adm-form-group">
                <span class="adm-label">Group name</span>

                <Input
                    bind:value={name}
                    placeholder="Group name"
                    aria-label="Group name"
                />
            </div>

            <div class="adm-form-group">
                <span class="adm-label">Avatar URL optional</span>

                <Input
                    bind:value={avatar}
                    placeholder="https://..."
                    aria-label="Avatar URL optional"
                />
            </div>

            <div class="adm-actions">
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
        <section class="adm-meta-grid cols-5">
            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Type</span>
                <p class="adm-meta-value">{group.type || "GROUP"}</p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Scope</span>
                <p class="adm-meta-value">{getScopeLabel()}</p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Context</span>
                <p class="adm-meta-value">{getContextLabel()}</p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Created</span>
                <p class="adm-meta-value">{formatDate(group.created_at)}</p>
            </div>

            <div class="adm-meta-item plain">
                <span class="adm-meta-label">Updated</span>
                <p class="adm-meta-value">{formatDate(group.updated_at)}</p>
            </div>
        </section>

        <section class="adm-detail-section">
            <h4 class="adm-section-title">Latest Message</h4>

            <p class="adm-row-muted">
                {group.latestMsg?.content || "No messages yet"}
            </p>
        </section>
    {/if}

    <section class="adm-detail-section">
        <div class="adm-detail-header">
            <h4 class="adm-section-title">Members</h4>

            <span class="adm-pill">
                {group.members?.length || group.memberCount || 0}
            </span>
        </div>

        {#if group.members && group.members.length > 0}
            <div class="adm-list adm-list-scroll">
                {#each group.members as member (member.id)}
                    <div class="adm-list-item">
                        <Avatar
                            name={member.fullname || member.username || "User"}
                            src={member.avatar ?? undefined}
                            size="sm"
                        />

                        <div class="adm-list-meta">
                            <strong class="adm-list-title">
                                {member.fullname || member.username || "User"}
                            </strong>

                            <span class="adm-list-subtitle">
                                {member.username || member.id}
                            </span>
                        </div>

                        <Badge color="info" size="sm">
                            {member.role || "MEMBER"}
                        </Badge>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="adm-empty-state">
                <span>No member details returned from backend.</span>
            </div>
        {/if}
    </section>

    <div class="adm-modal-footer">
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
