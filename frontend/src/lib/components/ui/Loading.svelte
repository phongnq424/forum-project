<script lang="ts">
    import Icon from "$lib/components/ui/Icon.svelte";

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

    const spinnerSizes = {
        sm: "w-5 h-5 border-2",
        md: "w-8 h-8 border-3",
        lg: "w-12 h-12 border-4",
    };
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
        color: #6b7280;
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
        border: 3px solid rgba(99, 102, 241, 0.1);
        border-top-color: #6366f1;
        animation: spin 0.8s linear infinite;
    }

    /* Sizes */
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
        font-size: 0.9rem;
        font-weight: 500;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
