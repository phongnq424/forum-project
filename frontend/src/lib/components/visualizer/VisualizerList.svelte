<script lang="ts">
    import type {
        VisualizerCategory,
        VisualizerItem,
    } from "$lib/types/visualizer.type";
    import VisualizerCard from "./VisualizerCard.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let {
        visualizers,
        searchQuery,
        activeCategory,
        completedSlugs,
    }: {
        visualizers: VisualizerItem[];
        searchQuery: string;
        activeCategory: VisualizerCategory | "ALL";
        completedSlugs: string[];
    } = $props();
</script>

<div class="visualizer-list">
    <div class="list-header">
        <div class="h-status">STATUS</div>
        <div class="h-title">VISUALIZER</div>
        <div class="h-difficulty">DIFFICULTY</div>
        <div class="h-time">TIME</div>
    </div>

    {#each visualizers as item (item.slug)}
        <VisualizerCard
            visualizer={item}
            completed={completedSlugs.includes(item.slug)}
        />
    {:else}
        <div class="empty-state">
            <Icon name="folder" size={40} />
            <p>
                No {activeCategory} visualizers found{searchQuery
                    ? ` matching "${searchQuery}"`
                    : ""}.
            </p>
        </div>
    {/each}
</div>

<style>
    .visualizer-list {
        background: #1e222b;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        overflow: hidden;
    }

    .list-header {
        display: grid;
        grid-template-columns: 60px 1fr 120px 80px;
        gap: 20px;
        padding: 14px 20px;
        background: #252a35;
        font-size: 12px;
        font-weight: 700;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #2a2e36;
    }

    .h-status {
        text-align: right;
    }

    .h-title {
        text-align: left;
    }

    .h-difficulty,
    .h-time {
        text-align: center;
    }

    .empty-state {
        padding: 60px;
        text-align: center;
        color: #6b7280;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
    }

    @media (max-width: 640px) {
        .list-header {
            display: none;
        }
    }
</style>
