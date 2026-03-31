<script lang="ts">
    import { fade, slide } from "svelte/transition";

    let {
        value = $bindable(),
        options = [],
        label = "",
        placeholder = "Chọn một tùy chọn...",
        disabled = false,
        inline = false,
        class: className = "",
    } = $props();

    let isOpen = $state(false);

    // Tìm label của giá trị hiện tại để hiển thị
    let selectedLabel = $derived(
        options.find((opt) => opt.value === value)?.label || placeholder,
    );

    function toggle() {
        if (!disabled) isOpen = !isOpen;
    }

    function selectOption(optValue: any) {
        value = optValue;
        isOpen = false;
    }

    // Đóng khi click ra ngoài (Svelte 5 way)
    function handleOutsideClick(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) isOpen = false;
        };
        document.addEventListener("click", handleClick);
        return {
            destroy() {
                document.removeEventListener("click", handleClick);
            },
        };
    }
</script>

<div
    class="input-group {className}"
    class:is-inline={inline}
    use:handleOutsideClick
>
    {#if label}
        <span class="label">{label}</span>
    {/if}

    <div class="select-wrapper">
        <button
            type="button"
            class="custom-select-trigger"
            class:is-open={isOpen}
            {disabled}
            onclick={toggle}
        >
            <span class:placeholder={!value}>{selectedLabel}</span>
            <div class="custom-arrow" class:rotated={isOpen}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </div>
        </button>

        {#if isOpen}
            <div class="dropdown-menu" transition:slide={{ duration: 200 }}>
                {#each options as opt}
                    <button
                        type="button"
                        class="option-item"
                        class:selected={opt.value === value}
                        onclick={() => selectOption(opt.value)}
                    >
                        {opt.label}
                        {#if opt.value === value}
                            <svg
                                class="check-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        {/if}
                    </button>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: Poppins;
    }

    .label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-family: Poppins;
        color: #a1a1aa;
        font-weight: 500;
    }

    .select-wrapper {
        position: relative;
        width: 100%;
    }

    /* Trigger Button */
    .custom-select-trigger {
        width: 100%;
        padding: 12px 14px;
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px; /* Bo góc nhất quán */
        color: white;
        font-size: 14px;
        font-family: Poppins;
        text-align: left;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.2s ease;
    }

    .custom-select-trigger:focus:not(:disabled),
    .is-open {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    /* Dropdown Menu - Phần quan trọng nhất */
    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: #1c1f26;
        border: 1px solid #2a2e36;
        border-radius: 12px; /* Đã bo góc cực đẹp */
        overflow: hidden;
        z-index: 100;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
        padding: 4px;
    }

    .option-item {
        width: 100%;
        padding: 10px 12px;
        background: transparent;
        border: none;
        color: #d1d1d6;
        text-align: left;
        font-size: 14px;
        font-family: Poppins;
        cursor: pointer;
        border-radius: 8px; /* Bo góc cho từng item bên trong */
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: background 0.2s;
    }

    .option-item:hover {
        background: #2a2e36;
        color: white;
    }

    .option-item.selected {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
    }

    .check-icon {
        width: 14px;
        height: 14px;
    }

    .custom-arrow {
        width: 16px;
        height: 16px;
        color: #a1a1aa;
        transition: transform 0.3s ease;
    }

    .custom-arrow.rotated {
        transform: rotate(180deg);
    }

    .placeholder {
        color: #52525b;
    }

    .is-inline {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }
    .is-inline .label {
        margin-bottom: 0;
    }
</style>
