<script lang="ts">
    let {
        error = "",
        compact = false,
        class: className = "",
    } = $props<{
        error?: string;
        compact?: boolean;
        class?: string;
    }>();
</script>

{#if error}
    <div class={`error-box ${compact ? "compact" : ""} ${className}`}>
        {error}
    </div>
{/if}

<style>
    .error-box {
        background: var(--ui-danger-soft);
        color: var(--ui-danger);
        padding: 12px;
        border-radius: var(--ui-radius-sm);
        font-size: 14px;
        text-align: center;
        margin-bottom: 20px;
        border: 1px solid var(--ui-danger-border);
    }

    .error-box.compact {
        margin-bottom: 0;
        text-align: left;
    }
</style>
