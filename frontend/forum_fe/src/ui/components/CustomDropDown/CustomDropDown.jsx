import { useState, useRef, useEffect } from "react";

export default function CustomDropDown({
  options = [null],
  display,
  onChange,
  onBlur,
  indexValueSelected,
  disPlayField = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options[indexValueSelected]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative w-full group">
        {/* Ô input hiện tại */}
        <input
          type="text"
          placeholder=""
          value={disPlayField == null ? selected : selected[disPlayField]}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="peer w-full px-4 pb-1 pt-5 text-[14px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear cursor-pointer"
        />

        <label
          className="absolute left-4 top-1 text-white/60 text-[10px] transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-[14px] peer-placeholder-shown:text-white/70
                    peer-focus:top-1 peer-focus:text-[10px] peer-focus:text-proPurple"
        >
          {display}
        </label>
      </div>

      {isOpen && (
        <div className="absolute mt-1 w-full bg-primary b rounded-2xl max-h-60 overflow-y-auto z-10">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelected(option);
                onChange?.(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-[14px] ${
                option === selected
                  ? "bg-purple-600 font-semibold"
                  : "hover:bg-white/10"
              }`}
            >
              {disPlayField == null ? option : option[disPlayField]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
