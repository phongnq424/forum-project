<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    type Props = HTMLInputAttributes & {
        label?: string;
        inline?: boolean;
        onchange?: (e: Event) => void;
    };

    let {
        label = "",
        id = crypto.randomUUID(),
        inline = false,
        class: inputClass = "",
        ...rest
    }: Props = $props();

    const inputId = $derived(String(id));
</script>

<div class="wrapper" class:inline>
    {#if label}
        <label class="label" for={inputId}>{label}</label>
    {/if}

    <div class="input-container">
        <input
            {...rest}
            id={inputId}
            type="file"
            class={`file-input ${inputClass}`}
        />
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }

    .wrapper.inline {
        width: auto;
        min-width: 0;
    }

    .label {
        font-size: 13px;
        color: var(--ui-text-muted);
        font-weight: 500;
    }

    .input-container {
        width: 100%;
        min-width: 0;
    }

    .file-input {
        width: 100%;
        padding: 8px 12px;
        background: var(--ui-surface-raised);
        border: 1px dashed var(--ui-primary);
        border-radius: 10px;
        color: var(--ui-text-muted);
        cursor: pointer;
        font-size: 14px;
        box-sizing: border-box;
    }

    .wrapper.inline .file-input {
        max-width: 320px;
    }

    .file-input:focus {
        outline: none;
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 2px var(--ui-primary-soft);
    }

    .file-input::file-selector-button {
        background: var(--ui-border);
        color: var(--ui-text-inverse);
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        margin-right: 12px;
        cursor: pointer;
        font-family: inherit;
    }

    .file-input::file-selector-button:hover {
        background: var(--ui-border-strong);
    }
</style>
