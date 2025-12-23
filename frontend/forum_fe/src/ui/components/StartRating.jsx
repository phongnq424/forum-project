import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { FaStar } from "react-icons/fa"; // react-icons để dùng icon star

const StarRating = forwardRef(function ({ totalStars = 5, onChange }, ref) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  }));

  const refStarRating = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        refStarRating.current &&
        !refStarRating.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {isOpen && (
        <div
          ref={refStarRating}
          className="flex space-x-1 absolute mt-1 z-2 py-2 px-2 rounded-lg bg-primary"
        >
          {Array.from({ length: totalStars }, (_, index) => {
            const starNumber = index + 1;
            const isFilled = starNumber <= (hoveredStar || selectedStar);
            return (
              <FaStar
                key={index}
                size={30}
                className={`cursor-pointer transition-colors ${
                  isFilled ? "text-yellow-400" : "text-gray-400"
                }`}
                onMouseEnter={() => setHoveredStar(starNumber)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => {
                  setSelectedStar(starNumber);
                  onChange?.(starNumber);
                  setIsOpen(false);
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
});

export default StarRating;
