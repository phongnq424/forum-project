import { useState, useRef, useEffect } from "react";

export default function CustomDropDown({
  options = [null],
  display,
  onChange,
  onBlur,
  indexValueSelected,
  disPlayField = null,
  variant,
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

  const variants = {
    createProfile: (
      <>
        <div className="relative w-full">
          {/* Ô input hiện tại */}
          <input
            type="text"
            placeholder=""
            value={disPlayField == null ? selected : selected[disPlayField]}
            readOnly
            onClick={() => setIsOpen(!isOpen)}
            className="peer w-full px-4 pb-1 pt-6 text-[20px] rounded-2xl focus:outline-none bg-white/10 focus:ring-2 focus:ring-proPurple transition-all duration-200 ease-linear cursor-pointer"
          />

          <label
            className="absolute left-4 top-1 text-white/60 text-[14px] transition-all duration-200 pointer-events-none
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-[20px] peer-placeholder-shown:text-white/70
                    peer-focus:top-1 peer-focus:text-[14px] peer-focus:text-proPurple"
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
                className={`px-4 py-2 cursor-pointer text-[20px] ${
                  option === selected
                    ? "bg-proPurple font-semibold hover:bg-proPurple/50"
                    : "hover:bg-white/10"
                }`}
              >
                {disPlayField == null ? option : option[disPlayField]}
              </div>
            ))}
          </div>
        )}
      </>
    ),
  };

  return (
    <div ref={dropdownRef} className="relative">
      {variants[variant]}
    </div>
  );
}
