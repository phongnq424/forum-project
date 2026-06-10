<script lang="ts">
    import { fly } from "svelte/transition";
    import type { Snippet } from "svelte";

    let {
        show = $bindable(false),
        align = "right",
        children,
    } = $props<{
        show?: boolean;
        align?: "left" | "right";
        children?: Snippet;
    }>();

    let wrapperEl = $state<HTMLElement | null>(null);

    const handlePointerDown = (e: PointerEvent) => {
        if (!wrapperEl) return;
        if (e.composedPath().includes(wrapperEl)) return;
        show = false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") show = false;
    };

    $effect(() => {
        if (!show) return;

        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("keydown", handleKeyDown);
        };
    });
</script>

{#if show}
    <div
        bind:this={wrapperEl}
        class="dropdown-wrapper {align === 'left' ? 'left' : 'right'}"
        transition:fly={{ y: -8, duration: 120 }}
        role="menu"
        aria-hidden={!show}
    >
        <div class="dropdown-content">
            {@render children?.()}
        </div>
    </div>
{/if}

<style>
    .dropdown-wrapper {
        position: absolute;
        top: 100%;
        margin-top: 6px;
        z-index: 100;
        min-width: 170px;
    }

    .dropdown-wrapper.right {
        right: 0;
    }

    .dropdown-wrapper.left {
        left: 0;
    }

    .dropdown-content {
        background: var(--ui-surface-soft);
        border: 1px solid var(--ui-border-strong);
        border-radius: var(--ui-radius-lg);
        padding: 6px;
        box-shadow: var(--ui-shadow-soft);
    }

    .dropdown-content :global(button),
    .dropdown-content :global(a) {
        width: 100%;
        background: transparent;
        border: none;
        color: var(--ui-text);
        padding: 10px 12px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: var(--ui-radius-sm);
        cursor: pointer;
        font-size: 14px;
        transition:
            background-color 0.15s ease,
            color 0.15s ease;
        text-decoration: none;
        font-family: inherit;
    }

    .dropdown-content :global(button:hover),
    .dropdown-content :global(a:hover) {
        background: var(--ui-surface-hover);
        color: var(--ui-text-strong);
    }

    .dropdown-content :global(.logout-btn) {
        color: var(--ui-danger);
    }

    .dropdown-content :global(.logout-btn:hover) {
        background: var(--ui-danger-soft);
        color: var(--ui-danger);
    }
</style>
