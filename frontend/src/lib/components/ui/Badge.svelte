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
        background: #1f2230;
        color: #a1a1aa;
        border-color: #2a2e36;
    }

    .success {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.3);
    }

    .warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border-color: rgba(245, 158, 11, 0.3);
    }

    .danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border-color: rgba(239, 68, 68, 0.3);
    }

    .info {
        background: rgba(99, 102, 241, 0.15);
        color: #6366f1;
        border-color: rgba(99, 102, 241, 0.3);
    }

    .outline {
        background: #14161c;
        color: #9ca3af;
        border-color: #2a2e36;
        cursor: pointer;
    }

    .outline:hover {
        background: #1f2230; /* Hiệu ứng hover nhẹ */
        color: #d1d5db;
    }
</style>
