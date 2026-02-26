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
        ...rest
    }: Props = $props();
</script>

<div class="wrapper">
    {#if label}<label class="label">{label}</label>{/if}

    <div class="input-container">
        {#if icon}
            <div class="icon-wrapper">{@render icon()}</div>
        {/if}
        <input
            class={`input ${error ? "error" : ""} ${icon ? "has-icon" : ""}`}
            bind:value
            {...rest}
        />
    </div>

    {#if error}<span class="error-text">{error}</span>{/if}
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

    .input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 12px;
        border: 1px solid #2a2e36;
        background: #14161c;
        color: #e5e7eb;
        font-size: 14px;
        font-family: inherit;
        outline: none;
        transition: 0.2s ease;
    }

    .input::placeholder {
        color: #6b7280;
    }

    .input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }

    .error-text {
        font-size: 12px;
        color: #ef4444;
    }
    .input-container {
        position: relative;
        display: flex;
        align-items: center;
    }
    .icon-wrapper {
        position: absolute;
        left: 12px;
        color: #6b7280;
        display: flex;
    }
    .input.has-icon {
        padding-left: 40px;
    }
</style>
