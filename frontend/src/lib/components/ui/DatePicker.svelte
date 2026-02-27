<script lang="ts">
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
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><rect x="3" y="4" width="18" height="18" rx="2" ry="2"
                ></rect><line x1="16" y1="2" x2="16" y2="6"></line><line
                    x1="8"
                    y1="2"
                    x2="8"
                    y2="6"
                ></line><line x1="3" y1="10" x2="21" y2="10"></line></svg
            >
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
        color: #a1a1aa;
        font-weight: 500;
    }

    .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .custom-date-input {
        background: #14161c;
        border: 1px solid #2a2e36;
        border-radius: 12px;
        padding: 12px 14px;
        color: #e5e7eb;
        width: 100%;
        font-family: inherit; /* Quan trọng: để không bị font hệ thống đè */
        font-size: 14px;
        transition: all 0.2s;
        box-sizing: border-box;
        cursor: text;
    }

    .custom-date-input:focus {
        outline: none;
        border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
    }

    /* Mẹo: Làm cho cái icon lịch mặc định của browser to ra phủ hết ô hoặc ẩn đi */
    /* Ở đây tui chọn cách ẩn icon cũ nhưng giữ vùng click để hiện bảng lịch */
    .custom-date-input::-webkit-calendar-picker-indicator {
        cursor: pointer;
        opacity: 0; /* Ẩn icon gốc */
        position: absolute;
        right: 10px;
        width: 25px;
        height: 25px;
    }

    .calendar-icon {
        position: absolute;
        right: 14px;
        color: #6b7280;
        pointer-events: none; /* Click xuyên qua để dính vào indicator ẩn bên dưới */
    }

    /* Style cho các ô nhập số (ngày, tháng, năm) cho đẹp */
    .custom-date-input::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
    }
    .custom-date-input::-webkit-datetime-edit-text {
        color: #4b5563;
        padding: 0 4px;
    }
    .custom-date-input::-webkit-datetime-edit-year-field,
    .custom-date-input::-webkit-datetime-edit-month-field,
    .custom-date-input::-webkit-datetime-edit-day-field {
        color: #e5e7eb;
        border-radius: 4px;
    }
    .custom-date-input::-webkit-datetime-edit-year-field:focus,
    .custom-date-input::-webkit-datetime-edit-month-field:focus,
    .custom-date-input::-webkit-datetime-edit-day-field:focus {
        background: #6366f1;
        color: white;
    }
</style>
