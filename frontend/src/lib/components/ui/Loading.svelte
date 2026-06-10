<script lang="ts">
    type Props = {
        message?: string;
        size?: "sm" | "md" | "lg";
        fullPage?: boolean;
    };

    let {
        message = "Loading...",
        size = "md",
        fullPage = false,
    }: Props = $props();
</script>

<div class="loading-container" class:full-page={fullPage}>
    <div class={`spinner ${size}`}></div>

    {#if message}
        <p class="loading-text">{message}</p>
    {/if}
</div>

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 40px 20px;
        color: var(--ui-text-soft);
    }

    .full-page {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 9999;
    }

    .spinner {
        border-radius: 50%;
        border: 3px solid var(--ui-primary-soft);
        border-top-color: var(--ui-primary);
        animation: spin 0.8s linear infinite;
    }

    .sm {
        width: 20px;
        height: 20px;
        border-width: 2px;
    }

    .md {
        width: 32px;
        height: 32px;
        border-width: 3px;
    }

    .lg {
        width: 48px;
        height: 48px;
        border-width: 4px;
    }

    .loading-text {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--ui-text-muted);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
