<script lang="ts">
    import { fly } from "svelte/transition";
    import type { Snippet } from "svelte"; // Import type Snippet

    let {
        show = $bindable(false),
        align = "right",
        children, // Nhận children snippet thay vì slot
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
        background: #1f2937;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 6px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
    }

    /* ĐÃ THÊM :global(a) VÀO ĐÂY */
    .dropdown-content :global(button),
    .dropdown-content :global(a) {
        width: 100%;
        background: transparent;
        border: none;
        color: #d1d5db;
        padding: 10px 12px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        transition: 0.15s;
        text-decoration: none; /* Xóa gạch chân cho thẻ a */
        font-family: inherit;
    }

    .dropdown-content :global(button:hover),
    .dropdown-content :global(a:hover) {
        background: #374151;
        color: #fff;
    }

    .dropdown-content :global(.logout-btn) {
        color: #ef4444;
    }
    .dropdown-content :global(.logout-btn:hover) {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
    }
</style>
