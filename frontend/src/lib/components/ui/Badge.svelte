<script lang="ts">
    type Props = {
        color?:
            | "default"
            | "success"
            | "warning"
            | "danger"
            | "info"
            | "outline";
        size?: "sm" | "md";
    };

    let { color = "default", size = "md" }: Props = $props();
</script>

<span class={`badge ${color} ${size}`}>
    <slot />
</span>

<style>
    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 999px;
        font-weight: 600;
        letter-spacing: 0.3px;
        border: 1px solid transparent;
    }

    /* Sizes */
    .sm {
        font-size: 11px;
        padding: 3px 8px;
    }

    .md {
        font-size: 12px;
        padding: 5px 12px;
    }

    /* Variants */

    .default {
        background: var(--ui-surface-soft);
        color: var(--ui-text-muted);
        border-color: var(--ui-border);
    }

    .success {
        background: var(--ui-success-soft);
        color: var(--ui-success);
        border-color: var(--ui-success-border);
    }

    .warning {
        background: var(--ui-warning-soft);
        color: var(--ui-warning);
        border-color: var(--ui-warning-border);
    }

    .danger {
        background: var(--ui-danger-soft);
        color: var(--ui-danger);
        border-color: var(--ui-danger-border);
    }

    .info {
        background: var(--ui-info-soft);
        color: var(--ui-info);
        border-color: var(--ui-info-border);
    }

    .outline {
        background: var(--ui-surface-raised);
        color: var(--ui-text-muted);
        border-color: var(--ui-border);
        cursor: pointer;
    }

    .outline:hover {
        background: var(--ui-surface-hover);
        color: var(--ui-text);
    }
</style>
