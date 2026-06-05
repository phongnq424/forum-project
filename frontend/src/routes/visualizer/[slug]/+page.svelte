<script lang="ts">
    import { page } from "$app/state";
    import { visualizers } from "$lib/data/visualizers";
    import Badge from "$lib/components/ui/Badge.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    import VisualizerRenderer from "$lib/components/visualizer/VisualizerRenderer.svelte";

    const slug = $derived(String(page.params.slug));
    const visualizer = $derived(
        visualizers.find((item) => item.slug === slug) ?? null,
    );
</script>

<svelte:head>
    <title
        >{visualizer ? `${visualizer.title} | Visualizer` : "Visualizer"}</title
    >
</svelte:head>

<div class="page-wrapper">
    <div class="container">
        {#if visualizer}
            <a href="/visualizer" class="back-link"> ← Back to visualizers </a>

            <header class="detail-header">
                <div>
                    <div class="meta-row">
                        <Badge color="outline" size="sm">
                            {visualizer.category}
                        </Badge>

                        <Badge color="outline" size="sm">
                            {visualizer.difficulty}
                        </Badge>

                        <span class="time">
                            {visualizer.estimatedTime} min
                        </span>
                    </div>

                    <h1>{visualizer.title}</h1>
                    <p>{visualizer.description}</p>
                </div>

                <div class="header-icon">
                    <Icon name="trending-up" size={28} />
                </div>
            </header>

            <VisualizerRenderer {slug} />
        {:else}
            <div class="not-found">
                <Icon name="folder" size={40} />
                <h2>Visualizer not found</h2>
                <p>The visualizer you are looking for does not exist.</p>
                <a href="/visualizer">Back to visualizers</a>
            </div>
        {/if}
    </div>
</div>

<style>
    .page-wrapper {
        min-height: 100vh;
        background: #0f1115;
        color: #e5e7eb;
        padding: 32px 20px;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
    }

    .back-link {
        display: inline-block;
        margin-bottom: 20px;
        color: #9ca3af;
        text-decoration: none;
        font-size: 14px;
    }

    .back-link:hover {
        color: #e5e7eb;
    }

    .detail-header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        padding: 22px;
        border-radius: 14px;
        background: #1e222b;
        border: 1px solid #2a2e36;
        margin-bottom: 24px;
    }

    .meta-row {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: 12px;
    }

    .time {
        color: #6b7280;
        font-size: 12px;
        font-weight: 700;
    }

    h1 {
        margin: 0;
        color: #f9fafb;
        font-size: 30px;
        letter-spacing: -0.03em;
    }

    p {
        margin: 10px 0 0;
        color: #9ca3af;
        line-height: 1.6;
        max-width: 760px;
    }

    .header-icon {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: rgba(99, 102, 241, 0.12);
        color: #818cf8;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .not-found {
        max-width: 520px;
        margin: 80px auto;
        text-align: center;
        padding: 30px;
        border-radius: 14px;
        background: #1e222b;
        border: 1px solid #2a2e36;
        color: #9ca3af;
    }

    .not-found h2 {
        color: #f9fafb;
        margin: 14px 0 8px;
    }

    .not-found a {
        display: inline-block;
        margin-top: 18px;
        color: #818cf8;
        text-decoration: none;
        font-weight: 700;
    }

    @media (max-width: 900px) {
        .page-wrapper {
            padding: 12px;
        }

        .detail-header {
            flex-direction: column;
        }

        h1 {
            font-size: 24px;
        }
    }
</style>
