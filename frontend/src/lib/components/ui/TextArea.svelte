<script lang="ts">
    let {
        value = $bindable(""),
        label = "",
        placeholder = "",
        rows = "3",
        id = "",
        disabled = false,
        required = false,
        ...rest
    } = $props<{
        value: string;
        label?: string;
        placeholder?: string;
        rows?: string | number;
        id?: string;
        disabled?: boolean;
        required?: boolean;
        [key: string]: any;
    }>();
</script>

<div class="textarea-group">
    {#if label}
        <label class="textarea-label" for={id}>{label}</label>
    {/if}
    <textarea
        {id}
        class="custom-textarea"
        bind:value
        {placeholder}
        {rows}
        {disabled}
        {required}
        {...rest}
    ></textarea>
</div>

<style>
    .textarea-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 100%;
    }

    .textarea-label {
        font-size: 13px;
        color: var(--ui-text-muted);
        font-weight: 500;
    }

    .custom-textarea {
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
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
        resize: vertical;
    }

    .custom-textarea::placeholder {
        color: var(--ui-text-soft);
    }

    .custom-textarea:focus {
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 3px var(--ui-primary-focus);
    }

    .custom-textarea:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
