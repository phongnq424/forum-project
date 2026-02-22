<script lang="ts">
    import { onMount } from "svelte";

    type Props = {
        open?: boolean;
        title?: string;
    };

    let { open = $bindable(false), title = "" }: Props = $props();

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
        on:click={close}
        on:keydown={handleKeydown}
    >
        <div class="modal" on:click|stopPropagation>
            <div class="header">
                <h3 id="modal-title">{title}</h3>

                <button
                    type="button"
                    class="close"
                    on:click={close}
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>

            <div class="content">
                <slot />
            </div>
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
    }

    .modal {
        width: 100%;
        max-width: 500px;
        background: linear-gradient(145deg, #171a22, #13151b);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 20px;
        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(99, 102, 241, 0.15);
        animation: modalIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 22px 24px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .close {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        color: #cbd5e1;
        cursor: pointer;
        transition: 0.2s ease;
    }

    .close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }

    .content {
        padding: 24px;
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
