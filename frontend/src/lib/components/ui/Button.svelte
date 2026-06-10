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
        border-radius: var(--ui-radius-lg);
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.3px;
        border: 1px solid transparent;
        cursor: pointer;
        transition:
            background-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
            border-color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
            color 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1),
            opacity 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .sm {
        padding: 6px 12px;
        font-size: 12px;
        border-radius: var(--ui-radius-sm);
        gap: 4px;
    }

    .md {
        padding: 10px 18px;
        font-size: 14px;
    }

    .btn:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px var(--ui-primary-focus);
    }

    .btn:active:not(:disabled) {
        transform: translateY(1px);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .primary {
        background: linear-gradient(
            135deg,
            var(--ui-primary),
            var(--ui-primary-2)
        );
        color: var(--ui-text-inverse);
        box-shadow: var(--ui-shadow-primary);
    }

    .primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 30px var(--ui-primary-focus);
    }

    .secondary {
        background: var(--ui-surface-soft);
        color: var(--ui-text);
        border-color: var(--ui-border);
        box-shadow: none;
    }

    .secondary:hover:not(:disabled) {
        background: var(--ui-surface-hover);
        border-color: var(--ui-border-strong);
    }

    .ghost {
        background: transparent;
        color: var(--ui-text-muted);
        border-color: transparent;
        box-shadow: none;
    }

    .ghost:hover:not(:disabled) {
        background: var(--ui-surface-hover);
        color: var(--ui-text-strong);
    }

    .danger {
        background: transparent;
        color: var(--ui-danger);
        border-color: var(--ui-danger);
        box-shadow: none;
        opacity: 0.85;
    }

    .danger:hover:not(:disabled) {
        background: var(--ui-danger-soft);
        color: var(--ui-danger-text);
        border-color: var(--ui-danger-border);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px var(--ui-danger-soft);
        opacity: 1;
    }
</style>
