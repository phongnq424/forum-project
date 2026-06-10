<!-- src/lib/components/ui/ToastContainer.svelte -->

<script lang="ts">
    import { toastState } from "$lib/states/toast.svelte";
</script>

<div class="toast-container">
    {#each toastState.items as toast (toast.id)}
        <div class="toast {toast.type}">
            <span>{toast.message}</span>

            <button type="button" onclick={() => toastState.remove(toast.id)}>
                ×
            </button>
        </div>
    {/each}
</div>

<style>
    .toast-container {
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
    }

    .toast {
        min-width: 280px;
        max-width: 380px;
        padding: 14px 16px;
        border-radius: 14px;
        background: var(--ui-surface-raised);
        color: var(--ui-text-strong);
        border: 1px solid var(--ui-border-strong);
        box-shadow: var(--ui-shadow-soft);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        pointer-events: auto;
        font-size: 14px;
        animation: slideIn 0.18s ease-out;
    }

    .toast.success {
        border-left: 4px solid var(--ui-success);
    }

    .toast.error {
        border-left: 4px solid var(--ui-danger);
    }

    .toast.info {
        border-left: 4px solid var(--ui-info);
    }

    .toast.warning {
        border-left: 4px solid var(--ui-warning);
    }

    .toast button {
        background: transparent;
        border: none;
        color: var(--ui-text-muted);
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
    }

    .toast button:hover {
        color: var(--ui-text-strong);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(16px);
        }

        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
</style>
