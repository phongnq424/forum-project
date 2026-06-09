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
        padding: 9px 16px;
        border-radius: 11px;
        font-size: 13px;
        font-weight: 560;
        letter-spacing: 0.2px;
        border: none;
        cursor: pointer;
        transition: all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .sm {
        padding: 5px 11px;
        font-size: 12px;
        border-radius: 8px;
        gap: 4px;
        font-weight: 550;
    }

    .md {
        padding: 9px 16px;
        font-size: 13px;
    }

    .btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.32);
    }

    .btn:active:not(:disabled) {
        transform: translateY(1px);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .primary {
        background: linear-gradient(135deg, #585bf0, #7c4fe6);
        color: white;
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.22);
    }

    .primary:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 9px 22px rgba(99, 102, 241, 0.3);
        filter: brightness(1.02);
    }

    .secondary {
        background: #1c1f26;
        color: #e5e7eb;
        border: 1px solid #2c3038;
    }

    .secondary:hover:not(:disabled) {
        background: #23262e;
        border-color: #3a3f4a;
    }

    .ghost {
        background: transparent;
        color: #a1a1aa;
    }

    .ghost:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    .danger {
        background: transparent;
        color: #ef5555;
        border: 1px solid rgba(239, 68, 68, 0.75);
        box-shadow: none;
        opacity: 0.82;
    }

    .danger:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.08);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.9);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(239, 68, 68, 0.1);
        opacity: 1;
    }
</style>
