<script lang="ts">
    let { value = $bindable(), options = [], label } = $props();
</script>

<div class="input-group">
    {#if label}
        <label class="label">{label}</label>
    {/if}
    <div class="select-wrapper">
        <select bind:value class="custom-select">
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
    .label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: #a1a1aa;
        font-weight: 500;
    }
    .select-wrapper {
        position: relative;
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
    }
    .custom-select:focus {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
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
</style>
