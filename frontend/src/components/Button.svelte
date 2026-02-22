<script lang="ts">
    import type { HTMLButtonAttributes } from "svelte/elements";

    type Props = HTMLButtonAttributes & {
        variant?: "primary" | "secondary" | "ghost";
    };

    let { variant = "primary", type = "button", ...rest }: Props = $props();
</script>

<button class={`btn ${variant}`} {type} {...rest}>
    <slot />
</button>

<style>
    .btn {
        padding: 10px 18px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.3px;
        border: none;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
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
</style>
