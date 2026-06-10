<script lang="ts">
    type Props = {
        padding?: string;
        variant?: "default" | "elevated" | "outline";
        hover?: boolean;
        class?: string;
        style?: string;
    };

    let {
        padding = "24px",
        variant = "default",
        hover = true,
        class: className = "",
        style = "",
    }: Props = $props();

    const mergedStyle = $derived(`--card-padding: ${padding}; ${style}`.trim());
</script>

<div
    class={`card ${variant} ${hover ? "hover" : ""} ${className}`}
    style={mergedStyle}
>
    <slot />
</div>

<style>
    .card {
        padding: var(--card-padding);
        border-radius: var(--ui-radius-xl);
        background: linear-gradient(
            145deg,
            var(--ui-surface),
            var(--ui-surface-raised)
        );
        border: 1px solid var(--ui-border-soft);
        transition:
            transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
            border-color 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 0.25s cubic-bezier(0.2, 0.8, 0.2, 1),
            background-color 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .default {
        box-shadow: var(--ui-shadow-soft);
    }

    .elevated {
        box-shadow:
            var(--ui-shadow-panel),
            0 0 40px var(--ui-primary-soft);
    }

    .outline {
        background: transparent;
        box-shadow: none;
        border-color: var(--ui-border);
    }

    .hover:hover {
        transform: translateY(-6px);
        border-color: var(--ui-primary-border);
        box-shadow:
            var(--ui-shadow-panel),
            0 0 50px var(--ui-primary-soft);
    }
</style>
