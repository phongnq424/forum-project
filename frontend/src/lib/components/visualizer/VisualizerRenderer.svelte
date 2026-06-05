<script lang="ts">
    import BinarySearchVisualizer from "./algorithms/BinarySearchVisualizer.svelte";
    import DijkstraVisualizer from "./algorithms/DijkstraVisualizer.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";

    let { slug }: { slug: string } = $props();
</script>

{#if slug === "binary-search"}
    <BinarySearchVisualizer />
{:else if slug === "dijkstra"}
    <DijkstraVisualizer />
{:else}
    <div class="coming-soon">
        <Icon name="folder" size={36} />
        <h3>Visualizer is coming soon</h3>
        <p>
            This algorithm has metadata, but its interactive component has not
            been implemented yet.
        </p>
    </div>
{/if}

<style>
    .coming-soon {
        padding: 60px 24px;
        border-radius: 14px;
        background: #1e222b;
        border: 1px solid #2a2e36;
        text-align: center;
        color: #9ca3af;
    }

    .coming-soon h3 {
        color: #f9fafb;
        margin: 14px 0 8px;
    }

    .coming-soon p {
        margin: 0;
        line-height: 1.6;
    }
</style>
