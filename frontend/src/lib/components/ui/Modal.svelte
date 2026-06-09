<script lang="ts">
    import { onMount, type Snippet } from "svelte";

    type Props = {
        open?: boolean;
        title?: string;
        maxWidth?: string;
        children?: Snippet;
        footer?: Snippet;
    };

    let {
        open = $bindable(false),
        title = "",
        maxWidth = "500px",
        children,
        footer,
    }: Props = $props();

    let overlayEl: HTMLDivElement | null = null;

    function close() {
        open = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") close();
    }

    onMount(() => {
        if (open && overlayEl) {
            overlayEl.focus();
        }
    });
</script>

{#if open}
    <div
        bind:this={overlayEl}
        class="overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabindex="0"
        onclick={close}
        onkeydown={handleKeydown}
    >
        <div
            class="modal"
            style="max-width: {maxWidth};"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="header">
                <h3 id="modal-title">{title}</h3>

                <button
                    type="button"
                    class="close"
                    onclick={close}
                    aria-label="Close modal"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="content">
                {@render children?.()}
            </div>

            {#if footer}
                <div class="footer">
                    {@render footer()}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        inset: 0;
        background: rgba(10, 12, 18, 0.75);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal {
        width: 100%;
        display: flex;
        flex-direction: column;
        max-width: 500px;
        max-height: 85vh;
        background: var(--ui-surface);
        border: 1px solid var(--ui-border-soft);
        border-radius: 20px;
        box-shadow: var(--ui-shadow-panel);
        animation: modalIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 24px;
        border-bottom: 1px solid var(--ui-border-soft);
        flex-shrink: 0;
    }

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--ui-text-strong);
    }

    .close {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: var(--ui-surface-raised);
        border: 1px solid var(--ui-border-soft);
        color: var(--ui-text-muted);
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .close:hover {
        background: var(--ui-danger-soft);
        color: var(--ui-danger-text);
        transform: rotate(90deg);
    }

    .content {
        padding: 24px;
        flex: 1;
        overflow-y: auto;
    }

    .footer {
        padding: 16px 24px;
        border-top: 1px solid var(--ui-border-soft);
        background: var(--ui-surface-raised);
        border-radius: 0 0 20px 20px;
        flex-shrink: 0;
    }

    .content::-webkit-scrollbar {
        width: 6px;
    }
    .content::-webkit-scrollbar-track {
        background: transparent;
    }
    .content::-webkit-scrollbar-thumb {
        background: var(--ui-border-strong);
        border-radius: 10px;
    }

    .content::-webkit-scrollbar-thumb:hover {
        background: var(--ui-text-soft);
    }

    .close svg {
        transition: transform 0.2s ease;
    }
    @keyframes modalIn {
        from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
</style>
