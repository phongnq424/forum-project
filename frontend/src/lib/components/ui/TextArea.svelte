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
        color: #a1a1aa;
        font-weight: 500;
    }

    .custom-textarea {
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
        resize: vertical;
    }

    .custom-textarea::placeholder {
        color: #6b7280;
    }

    .custom-textarea:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .custom-textarea:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
</style>
