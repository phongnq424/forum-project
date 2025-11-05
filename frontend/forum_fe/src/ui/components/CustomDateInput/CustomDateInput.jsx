import { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";
import "./CustomDateInput.css";
import General from "../../../General/General";

export default function CustomDateInput({
  display = "Date Time",
  selected = new Date(),
  onChange,
  onBlur,
  propForValueWorking,
  variant,
}) {
  const [selectedDate, setSelectedDate] = useState(selected);
  const datepickerRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100; // 100 năm trước
  const maxYear = currentYear; // năm hiện tại
  const maxDate = new Date();

  const variants = {
    createProfile: (
      <>
        <input
          type="text"
          placeholder=""
          value={selectedDate ? selectedDate.toLocaleDateString() : ""}
          readOnly
          onClick={() => datepickerRef.current.setOpen(true)} // click mở popup
          {...propForValueWorking}
          className="peer w-full px-4 pb-1 pt-6 text-[20px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear cursor-pointer"
        />

        <label
          className="absolute left-4 top-1 text-white/60 text-[14px] transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-[20px] peer-placeholder-shown:text-white/70
                    peer-focus:top-1 peer-focus:text-[14px] peer-focus:text-proPurple"
        >
          {display}
        </label>

        {/* Icon lịch */}
        <FaCalendarAlt
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none peer-focus:text-proPurple"
          size={24}
        />
      </>
    ),
  };

  return (
    <div className="relative w-full group">
      {/* Ô input hiện tại */}
      {variants[variant]}

      <DatePicker
        ref={datepickerRef}
        selected={selectedDate}
        onChange={(date) => {
          setSelectedDate(date);
          onChange?.(date);
        }}
        onBlur={(data) => onBlur?.(data)}
        customInput={<div className="hidden"></div>} // ẩn input mặc định
        dateFormat={General.constValue.dateTimeFormat}
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        minDate={new Date(minYear, 0, 1)}
        maxDate={maxDate}
        calendarClassName="custom-calendar"
      />
    </div>
  );
}
