<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    type Props = HTMLInputAttributes & {
        label?: string;
        // Svelte 5 khuyến khích định nghĩa rõ onchange trong props nếu muốn tường minh
        onchange?: (e: Event) => void;
    };

    let { label = "", ...rest }: Props = $props();
</script>

<div class="wrapper">
    {#if label}
        <label class="label">{label}</label>
    {/if}

    <div class="input-container">
        <input type="file" class="file-input" {...rest} />
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }

    .label {
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
    }

    .input-container {
        width: 100%;
    }

    .file-input {
        width: 100%;
        padding: 8px 12px;
        background: #14161c;
        border: 1px dashed #6366f1;
        border-radius: 10px;
        color: #9ca3af;
        cursor: pointer;
        font-size: 14px;
    }

    .file-input::file-selector-button {
        background: #2a2e36;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        margin-right: 12px;
    }
</style>
