<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";

    type Props = HTMLInputAttributes & {
        label?: string;
        error?: string;
        icon?: Snippet;
    };

    let {
        label = "",
        error = "",
        value = $bindable(""),
        icon,
        id = crypto.randomUUID(),
        ...rest
    }: Props = $props();

    const inputId = $derived(String(id));
</script>

<div class="wrapper">
    {#if label}
        <label class="label" for={inputId}>{label}</label>
    {/if}

    <div class="input-container">
        {#if icon}
            <div class="icon-wrapper">{@render icon()}</div>
        {/if}

        <input
            {...rest}
            id={inputId}
            class={`input ${error ? "error" : ""} ${icon ? "has-icon" : ""}`}
            bind:value
        />
    </div>

    {#if error}
        <span class="error-text">{error}</span>
    {/if}
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
        color: var(--ui-text-muted);
        font-weight: 500;
    }

    .input-container {
        position: relative;
        display: flex;
        align-items: center;
        width: 100%;
    }

    .input {
        width: 100%;
        padding: 12px 14px;
        border-radius: var(--ui-radius-lg);
        border: 1px solid var(--ui-border);
        background: var(--ui-surface-raised);
        color: var(--ui-text);
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            color 0.2s ease,
            opacity 0.2s ease;
        box-sizing: border-box;
    }

    .input::placeholder {
        color: var(--ui-text-soft);
    }

    .input:focus {
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 3px var(--ui-primary-focus);
    }

    .input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .error {
        border-color: var(--ui-danger);
        box-shadow: 0 0 0 3px var(--ui-danger-soft);
    }

    .error-text {
        font-size: 12px;
        color: var(--ui-danger);
    }

    .icon-wrapper {
        position: absolute;
        left: 12px;
        color: var(--ui-text-soft);
        display: flex;
        pointer-events: none;
    }

    .input.has-icon {
        padding-left: 40px;
    }
</style>
