<script lang="ts">
    import type { VisualizerItem } from "$lib/types/visualizer.type";
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let {
        completed = 0,
        total = 0,
        featuredVisualizers = [],
    }: {
        completed: number;
        total: number;
        featuredVisualizers: VisualizerItem[];
    } = $props();

    let progress = $derived(total > 0 ? (completed / total) * 100 : 0);
</script>

<aside class="visualizer-sidebar">
    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="trending-up" size={16} class="heading-icon" />
            Progress
        </h3>

        <div class="goal-minimal">
            <div class="goal-text">
                <span class="count">{completed}/{total}</span>
                <span class="label">visualizers completed</span>
            </div>

            <div class="progress-track">
                <div class="progress-fill" style:width="{progress}%"></div>
            </div>
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="flame" size={16} class="heading-icon" />
            Featured
        </h3>

        <div class="hot-list">
            {#each featuredVisualizers as item, index}
                <a href="/visualizer/{item.slug}" class="hot-item">
                    <span class="index">0{index + 1}</span>

                    <div class="hot-info">
                        <p class="hot-title">{item.title}</p>
                        <p class="hot-meta">
                            {item.estimatedTime} min • {item.difficulty}
                        </p>
                    </div>
                </a>
            {/each}
        </div>
    </Card>

    <Card variant="default" padding="20px">
        <h3 class="sidebar-heading">
            <Icon name="bell" size={16} class="heading-icon" />
            Tip
        </h3>

        <p class="tip-text">
            For graph algorithms, create a small graph first, then run step by
            step before testing larger graphs.
        </p>
    </Card>
</aside>

<style>
    .visualizer-sidebar {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .sidebar-heading {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #6b7280;
        margin-bottom: 20px;
    }

    .goal-minimal {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .goal-text {
        display: flex;
        align-items: baseline;
        gap: 6px;
    }

    .count {
        font-size: 20px;
        font-weight: 700;
        color: #e5e7eb;
    }

    .label {
        font-size: 13px;
        color: #6b7280;
    }

    .progress-track {
        height: 4px;
        background: #2a2e36;
        border-radius: 2px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: #6366f1;
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    .hot-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .hot-item {
        display: flex;
        gap: 15px;
        text-decoration: none;
        color: inherit;
    }

    .hot-item:hover .hot-title {
        color: #818cf8;
    }

    .index {
        font-size: 20px;
        font-weight: 800;
        color: #2a2e36;
        line-height: 1;
    }

    .hot-title {
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        line-height: 1.4;
        color: #e5e7eb;
    }

    .hot-meta {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
    }

    .tip-text {
        margin: 0;
        color: #9ca3af;
        font-size: 13px;
        line-height: 1.6;
    }

    :global(.heading-icon) {
        color: #6366f1;
        opacity: 0.8;
    }

    @media (max-width: 900px) {
        .visualizer-sidebar {
            display: none;
        }
    }
</style>
