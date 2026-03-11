<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { ChallengeType } from "$lib/types/challenge.type";

    let {
        searchQuery = $bindable(),
        sortBy = $bindable(),
        activeTab = $bindable(),
        categories,
        sortOptions,
    } = $props();
</script>

<header class="challenge-header">
    <div class="search-bar-wrapper">
        <div class="search-input">
            <Input
                placeholder="Search challenges, tags..."
                bind:value={searchQuery}
            >
                {#snippet icon()}
                    <Icon name="search" size={18} />
                {/snippet}
            </Input>
        </div>
        <div class="sort-filter">
            <Select
                label="Sort By:"
                inline={true}
                options={sortOptions}
                bind:value={sortBy}
                style="width: 180px;"
            />
        </div>
    </div>

    <div class="category-nav">
        <div class="chips-scroll">
            {#each categories as cat}
                <button
                    class="chip {activeTab === cat.id ? 'active' : ''}"
                    onclick={() => (activeTab = cat.id)}
                >
                    {cat.label}
                </button>
            {/each}
        </div>
    </div>
</header>

<style>
    .challenge-header {
        margin-bottom: 30px;
    }

    .search-bar-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        gap: 20px;
    }

    .search-input {
        flex: 1;
    }

    .sort-filter {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .category-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
    }

    .chips-scroll {
        display: flex;
        gap: 10px;
        overflow-x: auto;
        scrollbar-width: none;
    }

    .chips-scroll::-webkit-scrollbar {
        display: none;
    }

    .chip {
        padding: 8px 18px;
        background: #1e222b;
        border: 1px solid #2a2e36;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
        cursor: pointer;
        color: #9ca3af;
        transition: all 0.2s;
        font-family: inherit;
    }

    .chip:hover {
        border-color: #4b5563;
        color: white;
    }

    .chip.active {
        background: #6366f1;
        color: white;
        border-color: #6366f1;
    }

    @media (max-width: 900px) {
        .search-bar-wrapper {
            flex-direction: column;
            align-items: stretch;
        }
    }
</style>
