<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    type Props = HTMLInputAttributes & {
        label?: string;
        files?: FileList | undefined; // Dùng bind:files
    };

    let { label = "", files = $bindable(), ...rest }: Props = $props();
</script>

<div class="wrapper">
    {#if label}<label class="label">{label}</label>{/if}

    <div class="input-container">
        <input type="file" class="file-input" bind:files {...rest} />
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
        border: 1px dashed #6366f1; /* Viền đứt khúc nhìn giống khu vực drop file */
        border-radius: 10px;
        color: #9ca3af;
        cursor: pointer;
        font-size: 14px;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        outline: none;
    }

    .file-input:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .file-input:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Tùy chỉnh nút "Choose File" mặc định của trình duyệt */
    .file-input::file-selector-button {
        background: #2a2e36;
        color: #fff;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        margin-right: 12px;
        cursor: pointer;
        transition: background 0.2s;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
    }

    .file-input::file-selector-button:hover {
        background: #374151;
    }

    .file-input:disabled::file-selector-button {
        cursor: not-allowed;
    }
</style>
