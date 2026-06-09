<script lang="ts">
    import { onMount } from "svelte";
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Loading from "$lib/components/ui/Loading.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import { adminTopicService } from "$lib/services/topic.service";
    import { challengeService } from "$lib/services/challenge.service";
    import type { ConversationScope } from "$lib/types/chat-common.type";
    import type { AdminCreateGroupPayload } from "$lib/types/group.type";

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
        loading = false,
        error = "",
        onCreate,
        onClose,
    } = $props<{
        loading?: boolean;
        error?: string;
        onCreate?: (payload: AdminCreateGroupPayload) => void;
        onClose?: () => void;
    }>();

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

    let canSubmit = $derived(
        !loading &&
            !loadingTopics &&
            !loadingChallenges &&
            name.trim() !== "" &&
            (!requireTopic || topicId !== "") &&
            (!requireChallenge || challengeId !== ""),
    );

    onMount(() => {
        loadTopics();
        loadChallenges();
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

    $effect(() => {
        if (!showTopicSelect) {
            topicId = "";
        }

        if (!showChallengeSelect) {
            challengeId = "";
        }
    });

    function submit() {
        const groupName = name.trim();

        if (!groupName) return;
        if (requireTopic && !topicId) return;
        if (requireChallenge && !challengeId) return;

        onCreate?.({
            name: groupName,
            avatar: avatar.trim() || null,
            scope,
            topic_id: topicId || null,
            challenge_id: challengeId || null,
        });
    }
</script>

<form
    class="adm-form"
    onsubmit={(event) => {
        event.preventDefault();
        submit();
    }}
>
    <Select
        bind:value={scope}
        label="Group scope"
        placeholder="Select group scope"
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
                    <Loading size="sm" message="Loading challenges..." />
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
            placeholder="Example: SQL Discussion"
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

    <div class="adm-alert info">
        This group will be created based on its scope. Topic and challenge
        fields are shown only when the selected scope needs them.
    </div>

    {#if error}
        <div class="adm-alert-error">{error}</div>
    {/if}

    <div class="adm-modal-footer">
        <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onclick={onClose}
        >
            Cancel
        </Button>

        <Button type="submit" variant="primary" disabled={!canSubmit}>
            {loading ? "Creating..." : "Create Group"}
        </Button>
    </div>
</form>
