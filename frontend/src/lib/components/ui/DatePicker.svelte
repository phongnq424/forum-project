<script lang="ts">
    import Icon from "./Icon.svelte";

    let {
        value = $bindable(),
        label = "",
        id = crypto.randomUUID(),
    } = $props<{
        value: string;
        label?: string;
        id?: string;
    }>();
</script>

<div class="datepicker-group">
    {#if label}
        <label class="label" for={id}>{label}</label>
    {/if}

    <div class="input-wrapper">
        <input type="date" {id} bind:value class="custom-date-input" />

        <div class="calendar-icon">
            <Icon name="calendar" size={18} />
        </div>
    </div>
</div>

<style>
    .datepicker-group {
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

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .custom-date-input {
        background: var(--ui-surface-raised);
        border: 1px solid var(--ui-border);
        border-radius: var(--ui-radius-lg);
        padding: 12px 14px;
        color: var(--ui-text);
        width: 100%;
        font-family: inherit;
        font-size: 14px;
        transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            color 0.2s ease;
        box-sizing: border-box;
        cursor: text;
    }

    .custom-date-input:focus {
        outline: none;
        border-color: var(--ui-primary);
        box-shadow: 0 0 0 2px var(--ui-primary-soft);
    }

    .custom-date-input::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0;
        position: absolute;
        right: 10px;
        width: 25px;
        height: 25px;
    }

    .calendar-icon {
        position: absolute;
        right: 14px;
        color: var(--ui-text-soft);
        pointer-events: none;
    }

    .custom-date-input::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
    }

    .custom-date-input::-webkit-datetime-edit-text {
        color: var(--ui-text-soft);
        padding: 0 4px;
    }

    .custom-date-input::-webkit-datetime-edit-year-field,
    .custom-date-input::-webkit-datetime-edit-month-field,
    .custom-date-input::-webkit-datetime-edit-day-field {
        color: var(--ui-text);
        border-radius: 4px;
    }

    .custom-date-input::-webkit-datetime-edit-year-field:focus,
    .custom-date-input::-webkit-datetime-edit-month-field:focus,
    .custom-date-input::-webkit-datetime-edit-day-field:focus {
        background: var(--ui-primary);
        color: var(--ui-text-inverse);
    }
</style>
