<script lang="ts">
    // Dùng $props() theo cú pháp Svelte 5 của bạn
    let {
        value = $bindable(),
        options = [],
        label = "",
        name = "",
        disabled = false,
        inline = false,
        style = "",
        class: className = "",
    } = $props();
</script>

<div class="input-group {className}" class:is-inline={inline} {style}>
    {#if label}
        <label class="label" for={name}>{label}</label>
    {/if}

    <div class="select-wrapper">
        <select id={name} bind:value {disabled} class="custom-select">
            {#each options as opt}
                <option value={opt.value}>{opt.label}</option>
            {/each}
        </select>

        <div class="custom-arrow">
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <path d="M6 9l6 6 6-6" />
            </svg>
        </div>
    </div>
</div>

<style>
    .input-group {
        display: flex; /* Thay đổi thành flex-column để control width tốt hơn */
        flex-direction: column;
        width: 100%; /* Mặc định chiếm hết container chứa nó giống input thông thường */
    }

    .label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
    }

    .select-wrapper {
        position: relative;
        width: 100%;
    }

    .custom-select {
        appearance: none;
        -webkit-appearance: none;
        width: 100%;
        padding: 12px 40px 12px 14px;
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        color: white;
        box-sizing: border-box;
        font-family: inherit;
        font-size: 14px;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        outline: none;
        cursor: pointer;
    }

    .custom-select:focus:not(:disabled) {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .custom-select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .custom-arrow {
        position: absolute;
        right: 14px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        width: 16px;
        height: 16px;
        color: #a1a1aa;
    }
    .input-group.is-inline {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
    .input-group.is-inline .label {
        margin-bottom: 0;
        white-space: nowrap;
    }
</style>
