<script lang="ts">
    import { tick } from "svelte";
    import { slide } from "svelte/transition";

    type SelectValue = string | number | boolean | null | undefined;

    export type SelectOption = {
        value: SelectValue;
        label: string;
        disabled?: boolean;
    };

    type SelectPlacement = "auto" | "bottom" | "top";

    type Props = {
        value?: SelectValue;
        options?: SelectOption[];
        label?: string;
        placeholder?: string;
        disabled?: boolean;
        inline?: boolean;
        placement?: SelectPlacement;
        class?: string;
    };

    let {
        value = $bindable(),
        options = [],
        label = "",
        placeholder = "Chọn một tùy chọn...",
        disabled = false,
        inline = false,
        placement = "auto",
        class: className = "",
    }: Props = $props();

    let rootEl: HTMLDivElement | null = null;
    let measureEl: HTMLDivElement | null = null;

    let isOpen = $state(false);
    let openDirection: "bottom" | "top" = $state("bottom");
    let menuMaxHeight = $state(220);
    let menuWidth = $state(0);
    let menuLeft = $state(0);

    let selectedLabel = $derived(
        options.find((opt: SelectOption) => opt.value === value)?.label ||
            placeholder,
    );

    let isPlaceholder = $derived(
        value === "" || value === null || value === undefined,
    );

    function isScrollableElement(element: HTMLElement) {
        const style = window.getComputedStyle(element);
        const overflowY = style.overflowY;

        return (
            overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay"
        );
    }

    function getScrollBoundary() {
        if (!rootEl) {
            return {
                top: 0,
                bottom: window.innerHeight,
                left: 0,
                right: window.innerWidth,
            };
        }

        let parent = rootEl.parentElement;

        while (parent) {
            if (isScrollableElement(parent)) {
                const rect = parent.getBoundingClientRect();

                return {
                    top: rect.top,
                    bottom: rect.bottom,
                    left: rect.left,
                    right: rect.right,
                };
            }

            parent = parent.parentElement;
        }

        return {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth,
        };
    }

    async function toggle() {
        if (disabled) return;

        if (isOpen) {
            isOpen = false;
            return;
        }

        isOpen = true;

        await tick();

        updateDropdownPosition();
    }

    function updateDropdownPosition() {
        if (!rootEl) return;

        const triggerRect = rootEl.getBoundingClientRect();
        const boundary = getScrollBoundary();

        updateVerticalPosition(triggerRect, boundary);
        updateHorizontalSize(triggerRect, boundary);
    }

    function updateVerticalPosition(
        triggerRect: DOMRect,
        boundary: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        },
    ) {
        if (placement === "top") {
            openDirection = "top";
            menuMaxHeight = 220;
            return;
        }

        if (placement === "bottom") {
            openDirection = "bottom";
            menuMaxHeight = 220;
            return;
        }

        const availableBelow = boundary.bottom - triggerRect.bottom - 12;
        const availableAbove = triggerRect.top - boundary.top - 12;
        const desiredMenuHeight = Math.min(options.length * 44 + 12, 220);

        if (
            availableBelow < desiredMenuHeight &&
            availableAbove > availableBelow
        ) {
            openDirection = "top";
            menuMaxHeight = Math.max(120, Math.min(availableAbove, 220));
            return;
        }

        openDirection = "bottom";
        menuMaxHeight = Math.max(120, Math.min(availableBelow, 220));
    }

    function updateHorizontalSize(
        triggerRect: DOMRect,
        boundary: {
            top: number;
            bottom: number;
            left: number;
            right: number;
        },
    ) {
        const triggerWidth = rootEl?.offsetWidth ?? triggerRect.width;
        const measuredWidth = measureEl
            ? Math.ceil(measureEl.getBoundingClientRect().width) + 14
            : triggerWidth;

        const boundaryPadding = 12;
        const maxAllowedWidth =
            boundary.right - boundary.left - boundaryPadding * 2;

        const nextWidth = Math.min(
            Math.max(triggerWidth, measuredWidth),
            Math.max(triggerWidth, maxAllowedWidth),
        );

        let nextLeft = 0;
        const menuRight = triggerRect.left + nextWidth;
        const maxRight = boundary.right - boundaryPadding;

        if (menuRight > maxRight) {
            nextLeft = maxRight - triggerRect.left - nextWidth;
        }

        const menuLeftAbsolute = triggerRect.left + nextLeft;
        const minLeft = boundary.left + boundaryPadding;

        if (menuLeftAbsolute < minLeft) {
            nextLeft = minLeft - triggerRect.left;
        }

        menuWidth = nextWidth;
        menuLeft = nextLeft;
    }

    function selectOption(option: SelectOption) {
        if (option.disabled) return;

        value = option.value;
        isOpen = false;
    }

    function close() {
        isOpen = false;
    }

    function handleOutsideClick(node: HTMLElement) {
        const handleClick = (event: MouseEvent) => {
            if (!node.contains(event.target as Node)) {
                isOpen = false;
            }
        };

        document.addEventListener("click", handleClick);

        return {
            destroy() {
                document.removeEventListener("click", handleClick);
            },
        };
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            close();
        }
    }
</script>

<svelte:window
    onkeydown={handleKeydown}
    onresize={updateDropdownPosition}
    onscroll={updateDropdownPosition}
/>

<div
    bind:this={rootEl}
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
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            onclick={toggle}
        >
            <span class="trigger-label" class:placeholder={isPlaceholder}>
                {selectedLabel}
            </span>

            <span class="custom-arrow" class:rotated={isOpen}>
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </span>
        </button>

        {#if isOpen}
            <div
                class="dropdown-menu"
                class:open-top={openDirection === "top"}
                role="listbox"
                style={`width: ${menuWidth}px; left: ${menuLeft}px; max-height: ${menuMaxHeight}px;`}
                transition:slide={{ duration: 140 }}
            >
                {#each options as opt}
                    <button
                        type="button"
                        class="option-item"
                        class:selected={opt.value === value}
                        class:disabled={opt.disabled}
                        role="option"
                        aria-selected={opt.value === value}
                        disabled={opt.disabled}
                        onclick={() => selectOption(opt)}
                    >
                        <span class="option-label">{opt.label}</span>

                        {#if opt.value === value}
                            <svg
                                class="check-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="3"
                                aria-hidden="true"
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

<div bind:this={measureEl} class="option-measurer" aria-hidden="true">
    {#each options as opt}
        <div class="measure-option">
            <span>{opt.label}</span>
            <span class="measure-icon-space"></span>
        </div>
    {/each}
</div>

<style>
    .input-group {
        display: flex;
        flex-direction: column;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        font-family: Poppins, sans-serif;
    }

    .input-group * {
        box-sizing: border-box;
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
        min-width: 0;
        max-width: 100%;
    }

    .custom-select-trigger {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        padding: 12px 14px;
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        color: #ffffff;
        font-size: 14px;
        font-family: Poppins, sans-serif;
        font-weight: 400;
        text-align: left;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background-color 0.2s ease;
    }

    .custom-select-trigger:disabled {
        cursor: not-allowed;
        opacity: 0.65;
    }

    .custom-select-trigger:focus:not(:disabled),
    .custom-select-trigger.is-open {
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        outline: none;
    }

    .trigger-label {
        min-width: 0;
        flex: 1;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 400;
    }

    .placeholder {
        color: #52525b;
    }

    .custom-arrow {
        width: 16px;
        height: 16px;
        color: #a1a1aa;
        transition: transform 0.2s ease;
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .custom-arrow svg {
        width: 16px;
        height: 16px;
        display: block;
    }

    .custom-arrow.rotated {
        transform: rotate(180deg);
    }

    .dropdown-menu {
        position: absolute;
        top: calc(100% + 8px);
        min-width: 100%;
        max-width: calc(100vw - 24px);
        overflow-y: auto;
        overflow-x: hidden;
        background: #1c1f26;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        z-index: 999;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
        padding: 4px;
    }

    .dropdown-menu.open-top {
        top: auto;
        bottom: calc(100% + 8px);
    }

    .dropdown-menu::-webkit-scrollbar {
        width: 8px;
    }

    .dropdown-menu::-webkit-scrollbar-track {
        background: transparent;
    }

    .dropdown-menu::-webkit-scrollbar-thumb {
        background: #343946;
        border-radius: 999px;
    }

    .option-item {
        width: 100%;
        min-width: 0;
        padding: 10px 12px;
        background: transparent;
        border: none;
        color: #d1d1d6;
        text-align: left;
        font-size: 14px;
        font-family: Poppins, sans-serif;
        font-weight: 400;
        cursor: pointer;
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        transition: background 0.2s;
    }

    .option-item:hover:not(:disabled) {
        background: #2a2e36;
        color: #ffffff;
    }

    .option-item.selected {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
    }

    .option-item.disabled,
    .option-item:disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .option-label {
        min-width: 0;
        flex: 1;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 400;
    }

    .check-icon {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }

    .option-measurer {
        position: fixed;
        left: -9999px;
        top: -9999px;
        visibility: hidden;
        pointer-events: none;
        width: max-content;
        max-width: none;
        font-family: Poppins, sans-serif;
        font-size: 14px;
        font-weight: 400;
        z-index: -1;
    }

    .measure-option {
        width: max-content;
        max-width: none;
        padding: 10px 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        white-space: nowrap;
        font-size: 14px;
        font-family: Poppins, sans-serif;
        font-weight: 400;
    }

    .measure-icon-space {
        width: 14px;
        height: 14px;
        flex: 0 0 auto;
    }

    .is-inline {
        flex-direction: row;
        align-items: center;
        gap: 12px;
    }

    .is-inline .label {
        margin-bottom: 0;
        flex: 0 0 auto;
    }

    .is-inline .select-wrapper {
        flex: 1;
        min-width: 0;
    }
</style>
