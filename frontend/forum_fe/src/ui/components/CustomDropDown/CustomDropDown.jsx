import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";

const CustomDropDown = forwardRef(
  (
    {
      options = [null],
      display,
      onSelected,
      onBlur,
      displayField = null,
      variant,
      initIndexSelected = 0,
    },
    ref
  ) => {
    console.log(options);
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(options[initIndexSelected]);
    const dropdownRef = useRef(null);
    useEffect(
      function () {
        onSelected?.(selected);
      },
      [selected]
    );

    useEffect(() => {
      function handleClickOutside(event) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      setSelected(options[initIndexSelected]);
      onSelected?.(options[initIndexSelected]);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    }));

    const variants = {
      createProfile: (
        <>
          <div className="relative w-full">
            {/* Ô input hiện tại */}
            <input
              type="text"
              placeholder=""
              value={
                displayField == null || !selected
                  ? selected
                  : selected[displayField]
              }
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
            <div className="absolute mt-1 text-white w-full bg-primary b rounded-2xl max-h-60 overflow-y-auto z-10">
              {options.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-[20px] ${
                    option === selected
                      ? "bg-proPurple font-semibold hover:bg-proPurple/50"
                      : "hover:bg-white/10"
                  }`}
                >
                  {displayField == null ? option : option[displayField]}
                </div>
              ))}
            </div>
          )}
        </>
      ),

      options1: (
        <>
          <div className="absolute mt-1 text-white w-full bg-primary b rounded-2xl max-h-60 overflow-y-auto z-10">
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-[20px] ${
                  option === selected
                    ? "bg-proPurple font-semibold hover:bg-proPurple/50"
                    : "hover:bg-white/10"
                }`}
              >
                {displayField == null ? option : option[displayField]}
              </div>
            ))}
          </div>
        </>
      ),

      addPost: (
        <>
          <div className="relative w-full">
            {/* Ô input hiện tại */}
            <input
              type="text"
              placeholder=""
              value={
                displayField == null || !selected
                  ? selected
                  : selected[displayField]
              }
              readOnly
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:cursor-pointer text-white w-full h-fit bg-primary rounded-xl placeholder:text-muted-foreground text-lg resize-none focus:outline-none"
            ></input>
          </div>

          {isOpen && (
            <div className="absolute mt-1 w-full bg-primary b text-white rounded-2xl max-h-60 overflow-y-auto z-10">
              {options.map((option, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelected(option);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer text-lg ${
                    option === selected
                      ? "bg-proPurple font-semibold hover:bg-proPurple/50"
                      : "hover:bg-white/10"
                  }`}
                >
                  {displayField == null || !selected
                    ? option
                    : option[displayField]}
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
);

export default CustomDropDown;
