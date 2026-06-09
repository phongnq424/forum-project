<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Button from "$lib/components/ui/Button.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import type { ConversationScope } from "$lib/types/chat-common.type";

    type SelectOption = {
        value: string;
        label: string;
        disabled?: boolean;
    };

    let {
        search = $bindable(),
        scopeFilter = $bindable(),
        topicIdFilter = $bindable(),
        challengeIdFilter = $bindable(),
        topicOptions = [],
        challengeOptions = [],
        loading = false,
        onSearch,
        onReset,
    } = $props<{
        search: string;
        scopeFilter: ConversationScope | "";
        topicIdFilter: string;
        challengeIdFilter: string;
        topicOptions?: SelectOption[];
        challengeOptions?: SelectOption[];
        loading?: boolean;
        onSearch?: () => void;
        onReset?: () => void;
    }>();

    const scopeOptions: SelectOption[] = [
        { value: "", label: "All Scopes" },
        { value: "GENERAL", label: "General" },
        { value: "TOPIC_DISCUSSION", label: "Topic Discussion" },
        { value: "CHALLENGE_HELP", label: "Challenge Help" },
        { value: "STUDY_GROUP", label: "Study Group" },
        { value: "CLASS_GROUP", label: "Class Group" },
        { value: "AI_TUTOR", label: "AI Tutor" },
    ];

    let allTopicOptions = $derived<SelectOption[]>([
        { value: "", label: "All Topics" },
        ...topicOptions,
    ]);

    let allChallengeOptions = $derived<SelectOption[]>([
        { value: "", label: "All Challenges" },
        ...challengeOptions,
    ]);

    function submit() {
        onSearch?.();
    }

    function reset() {
        onReset?.();
    }
</script>

<section class="adm-panel adm-filter-panel">
    <form
        class="adm-filter-row cols-4"
        onsubmit={(event) => {
            event.preventDefault();
            submit();
        }}
    >
        <Input
            bind:value={search}
            placeholder="Search group name, topic or challenge..."
            onkeydown={(event: KeyboardEvent) => {
                if (event.key === "Enter") submit();
            }}
        >
            {#snippet icon()}
                <Icon name="search" size={18} />
            {/snippet}
        </Input>

        <Select
            bind:value={scopeFilter}
            options={scopeOptions}
            placeholder="All Scopes"
            disabled={loading}
        />

        <Select
            bind:value={topicIdFilter}
            options={allTopicOptions}
            placeholder="All Topics"
            disabled={loading}
        />

        <Select
            bind:value={challengeIdFilter}
            options={allChallengeOptions}
            placeholder="All Challenges"
            disabled={loading}
        />

        <div class="adm-actions">
            <Button type="submit" variant="primary" disabled={loading}>
                Search
            </Button>

            <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onclick={reset}
            >
                Reset
            </Button>
        </div>
    </form>
</section>
