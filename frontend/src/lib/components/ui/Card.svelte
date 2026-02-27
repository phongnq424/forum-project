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
        ...rest
    }: Props = $props();
</script>

<div
    class={`card ${variant} ${hover ? "hover" : ""}`}
    style={`--padding:${padding}`}
>
    <slot />
</div>

<style>
    .card {
        padding: var(--padding);
        border-radius: 18px;
        background: linear-gradient(145deg, #171a22, #13151b);
        border: 1px solid rgba(255, 255, 255, 0.06);
        transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* Default subtle shadow */
    .default {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }

    /* Elevated stronger depth */
    .elevated {
        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.45),
            0 0 40px rgba(99, 102, 241, 0.12);
    }

    /* Outline style */
    .outline {
        background: transparent;
        box-shadow: none;
        border: 1px solid #2a2e36;
    }

    /* Hover effect */
    .hover:hover {
        transform: translateY(-6px);
        border-color: rgba(99, 102, 241, 0.4);
        box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.45),
            0 0 50px rgba(99, 102, 241, 0.18);
    }
</style>
