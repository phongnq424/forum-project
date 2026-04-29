<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    type Props = HTMLButtonAttributes & {
        variant?: "primary" | "secondary" | "ghost" | "danger";
        size?: "sm" | "md";
        children?: () => any;
    };

    let {
        variant = "primary",
        size = "md",
        type = "button",
        children,
        ...rest
    }: Props = $props();
</script>

<button class={`btn ${variant} ${size}`} {type} {...rest}>
    {@render children?.()}
</button>

<style>
    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.3px;
        border: none;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .sm {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: 8px;
        gap: 4px;
    }

    .md {
        padding: 10px 18px;
        font-size: 14px;
    }

    .btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.4);
    }

    .btn:active:not(:disabled) {
        transform: translateY(1px);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* PRIMARY */
    .primary {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.3);
    }

    .primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px rgba(99, 102, 241, 0.4);
    }

    /* SECONDARY */
    .secondary {
        background: #1c1f26;
        color: #e5e7eb;
        border: 1px solid #2c3038;
    }

    .secondary:hover:not(:disabled) {
        background: #23262e;
        border-color: #3a3f4a;
    }

    /* GHOST */
    .ghost {
        background: transparent;
        color: #a1a1aa;
    }

    .ghost:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    /* DANGER */
    .danger {
        background: transparent;
        color: #ef4444;
        border: 1px solid #ef4444;
        box-shadow: none;
        opacity: 0.8;
    }

    .danger:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
        border-color: #dc2626;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
        opacity: 1;
    }
</style>
