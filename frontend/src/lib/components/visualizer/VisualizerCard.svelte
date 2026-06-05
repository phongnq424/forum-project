<script lang="ts">
    import type {
        VisualizerDifficulty,
        VisualizerItem,
    } from "$lib/types/visualizer.type";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let {
        visualizer,
        completed = false,
    }: {
        visualizer: VisualizerItem;
        completed?: boolean;
    } = $props();

    const difficultyColor: Record<
        VisualizerDifficulty,
        "success" | "warning" | "danger"
    > = {
        EASY: "success",
        MEDIUM: "warning",
        HARD: "danger",
    };
</script>

<a href="/visualizer/{visualizer.slug}" class="visualizer-row">
    <div class="col status">
        {#if completed}
            <div class="check-circle" title="Completed">
                <Icon name="check" size={14} />
            </div>
        {:else}
            <div class="dot-placeholder"></div>
        {/if}
    </div>

    <div class="col title">
        <div class="title-line">
            <h3 class="visualizer-title">{visualizer.title}</h3>

            {#if visualizer.featured}
                <span class="featured">Featured</span>
            {/if}
        </div>

        <p class="description">{visualizer.description}</p>

        <div class="tag-list">
            {#each visualizer.tags as tag}
                <Badge color="outline" size="sm">#{tag}</Badge>
            {/each}
        </div>
    </div>

    <div class="col difficulty">
        <Badge color={difficultyColor[visualizer.difficulty]} size="md">
            {visualizer.difficulty}
        </Badge>
    </div>

    <div class="col time">
        <span class="time-val">{visualizer.estimatedTime}</span>
        <span class="time-label">min</span>
    </div>
</a>

<style>
    .visualizer-row {
        display: grid;
        grid-template-columns: 60px 1fr 120px 80px;
        gap: 20px;
        align-items: center;
        padding: 16px 20px;
        text-decoration: none;
        color: inherit;
        border-bottom: 1px solid #2a2e36;
        transition: background-color 0.2s ease;
    }

    .visualizer-row:hover {
        background-color: #2a2f3b;
    }

    .visualizer-row:last-child {
        border-bottom: none;
    }

    .col {
        display: flex;
        align-items: center;
    }

    .col.status {
        justify-content: center;
    }

    .col.difficulty {
        justify-content: center;
    }

    .check-circle {
        width: 20px;
        height: 20px;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .dot-placeholder {
        width: 6px;
        height: 6px;
        background: #374151;
        border-radius: 50%;
    }

    .title {
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
    }

    .title-line {
        display: flex;
        gap: 8px;
        align-items: center;
    }

    .visualizer-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #f3f4f6;
    }

    .visualizer-row:hover .visualizer-title {
        color: #818cf8;
    }

    .featured {
        padding: 2px 7px;
        border-radius: 999px;
        background: rgba(99, 102, 241, 0.14);
        color: #a5b4fc;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
    }

    .description {
        margin: 6px 0 10px;
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.5;
    }

    .tag-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .col.time {
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .time-val {
        font-size: 18px;
        font-weight: 800;
        color: #e5e7eb;
        line-height: 1;
    }

    .time-label {
        font-size: 10px;
        text-transform: uppercase;
        color: #6b7280;
        font-weight: 600;
        letter-spacing: 0.05em;
    }

    @media (max-width: 640px) {
        .visualizer-row {
            grid-template-columns: 30px 1fr auto;
            grid-template-rows: auto auto;
            gap: 12px 10px;
            padding: 16px;
        }

        .col.status {
            grid-column: 1;
            grid-row: 1;
        }

        .title {
            grid-column: 2 / 4;
            grid-row: 1;
        }

        .col.difficulty {
            grid-column: 2;
            grid-row: 2;
            justify-content: flex-start;
        }

        .col.time {
            grid-column: 3;
            grid-row: 2;
            flex-direction: row;
            gap: 4px;
        }

        .description {
            display: none;
        }
    }
</style>
