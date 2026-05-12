<script lang="ts">
    import Card from "$lib/components/ui/Card.svelte";
    import Icon from "$lib/components/ui/Icon.svelte";
    let { challenge } = $props();
</script>

<Card padding="0">
    <div class="internal-header">
        <Icon name="folder" size={18} />
        <span>Description</span>
    </div>
    <div class="description-content">
        <div class="prose">{challenge.description}</div>
        {#if challenge.constraints}
            <div class="section-block">
                <h4>Constraints:</h4>
                <div class="code-block">{challenge.constraints}</div>
            </div>
        {/if}
        <div class="io-blocks">
            {#if challenge.type === "BACKEND"}
                <div class="section-block">
                    <h4>API Requirements:</h4>
                    <div class="code-block">{challenge.input}</div>
                </div>

                <div class="section-block">
                    <h4>Expected Behavior:</h4>
                    <div class="code-block">{challenge.output}</div>
                </div>
            {:else}
                <div class="section-block">
                    <h4>Sample Input:</h4>
                    <div class="code-block">{challenge.input}</div>
                </div>

                <div class="section-block">
                    <h4>Sample Output:</h4>
                    <div class="code-block">{challenge.output}</div>
                </div>
            {/if}
        </div>
    </div>
</Card>

<style>
    .internal-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        font-weight: 600;
        color: #d1d5db;
    }
    .description-content {
        padding: 20px;
        line-height: 1.6;
    }
    .prose {
        margin-bottom: 24px;
    }
    .section-block {
        margin-top: 20px;
    }
    .section-block h4 {
        font-size: 14px;
        color: #9ca3af;
        margin-bottom: 8px;
        font-weight: 600;
    }
    .code-block {
        background: #1f232b;
        padding: 12px;
        border-radius: 6px;
        font-family: monospace;
        color: #e5e7eb;
        white-space: pre-wrap;
    }
    .io-blocks {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-top: 24px;
    }
</style>
