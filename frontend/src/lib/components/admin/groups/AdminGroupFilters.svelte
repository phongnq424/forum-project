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

<section class="filter-panel">
    <form
        class="filter-row"
        onsubmit={(event) => {
            event.preventDefault();
            submit();
        }}
    >
        <div class="search-field">
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
        </div>

        <div class="filter-select">
            <Select
                bind:value={scopeFilter}
                options={scopeOptions}
                placeholder="All Scopes"
                disabled={loading}
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={topicIdFilter}
                options={allTopicOptions}
                placeholder="All Topics"
                disabled={loading}
            />
        </div>

        <div class="filter-select">
            <Select
                bind:value={challengeIdFilter}
                options={allChallengeOptions}
                placeholder="All Challenges"
                disabled={loading}
            />
        </div>

        <div class="actions">
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

<style>
    .filter-panel {
        background: #181b22;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 18px;
        box-shadow: 0 18px 40px rgba(0, 0, 0, 0.16);
        padding: 16px;
    }

    .filter-row {
        display: grid;
        grid-template-columns: minmax(260px, 1fr) 180px 190px 220px auto;
        gap: 10px;
        align-items: center;
    }

    .search-field {
        min-width: 0;
    }

    .filter-select {
        min-width: 0;
    }

    .actions {
        display: flex;
        align-items: center;
        gap: 10px;
        justify-content: flex-end;
        white-space: nowrap;
    }

    @media (max-width: 1180px) {
        .filter-row {
            grid-template-columns: minmax(240px, 1fr) 180px 190px;
        }

        .actions {
            grid-column: 1 / -1;
            justify-content: flex-start;
        }
    }

    @media (max-width: 760px) {
        .filter-row {
            grid-template-columns: 1fr;
        }

        .actions {
            width: 100%;
            justify-content: stretch;
        }
    }
</style>
