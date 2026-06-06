<script lang="ts">
    import Input from "$lib/components/ui/Input.svelte";
    import Select from "$lib/components/ui/Select.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import type { VisualizerCategory } from "$lib/types/visualizer.type";

    let {
        searchQuery = $bindable(),
        sortBy = $bindable(),
        activeCategory = $bindable(),
        categories,
        sortOptions,
    }: {
        searchQuery: string;
        sortBy: string;
        activeCategory: VisualizerCategory | "ALL";
        categories: { id: VisualizerCategory | "ALL"; label: string }[];
        sortOptions: { value: string; label: string }[];
    } = $props();
</script>

<header class="visualizer-header">
    <div class="intro">
        <div>
            <p class="eyebrow">Algorithm Visualizer</p>
            <h2>Understand algorithms by watching them run</h2>
            <p class="subtitle">
                Build inputs, control execution and observe every step of the
                algorithm visually.
            </p>
        </div>

        <div class="intro-card">
            <Icon name="trending-up" size={20} />
            <div>
                <span>Interactive mode</span>
                <strong>Create data, run algorithm, inspect each step</strong>
            </div>
        </div>
    </div>

    <div class="search-bar-wrapper">
        <div class="search-input">
            <Input
                placeholder="Search visualizers, algorithms, graph, sorting..."
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
            />
        </div>
    </div>

    <div class="category-nav">
        <div class="chips-scroll">
            {#each categories as cat}
                <button
                    class="chip"
                    class:active={activeCategory === cat.id}
                    onclick={() => (activeCategory = cat.id)}
                >
                    {cat.label}
                </button>
            {/each}
        </div>
    </div>
</header>

<style>
    .visualizer-header {
        margin-bottom: 30px;
    }

    .intro {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        margin-bottom: 28px;
    }

    .eyebrow {
        margin: 0 0 8px;
        color: #6366f1;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    h1 {
        margin: 0;
        color: #f9fafb;
        font-size: 32px;
        line-height: 1.15;
        letter-spacing: -0.03em;
    }

    .subtitle {
        max-width: 640px;
        margin: 12px 0 0;
        color: #9ca3af;
        font-size: 15px;
        line-height: 1.6;
    }

    .intro-card {
        width: 280px;
        display: flex;
        gap: 12px;
        padding: 16px;
        border: 1px solid #2a2e36;
        border-radius: 14px;
        background: #1e222b;
        color: #9ca3af;
    }

    .intro-card span {
        display: block;
        margin-bottom: 4px;
        color: #6b7280;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .intro-card strong {
        display: block;
        color: #e5e7eb;
        font-size: 14px;
        line-height: 1.4;
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
        .intro {
            flex-direction: column;
        }

        .intro-card {
            width: 100%;
            box-sizing: border-box;
        }

        .search-bar-wrapper {
            flex-direction: column;
            align-items: stretch;
        }

        h1 {
            font-size: 26px;
        }
    }
</style>
