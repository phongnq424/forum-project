<script lang="ts">
    let { error = "" } = $props();
</script>

{#if error}
    <div class="error-box">{error}</div>
{/if}

<style>
    .error-box {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        text-align: center;
        margin-bottom: 20px;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
</style>
