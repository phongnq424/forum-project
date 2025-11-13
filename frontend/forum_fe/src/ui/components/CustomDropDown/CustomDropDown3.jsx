import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useContext,
} from "react";
import AppContext from "../../Context/AppContext";
import { DetailPostPageContext } from "../../pages/DetailPostPage";

const CustomDropDown3 = forwardRef(
  ({ options = [null], onSelect, displayField = null, className }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const appContext = useContext(AppContext);
    const detailPostPageContext = useContext(DetailPostPageContext);

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
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useImperativeHandle(ref, () => ({
      open: () => {
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    }));

    return (
      <div
        ref={dropdownRef}
        className={`w-fit absolute bg-primary max-h-[300px] min-w-[200px] overflow-x-hidden overflow-y-auto rounded-lg z-20 ${className} text-white`}
      >
        {isOpen &&
          options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelect?.(option);
                setIsOpen(false);
              }}
              className={`px-4 py-2 cursor-pointer text-center text-[20px] hover:bg-proPurple`}
            >
              {displayField == null ? option : option[displayField]}
            </div>
          ))}
      </div>
    );
  }
);

export default CustomDropDown3;
