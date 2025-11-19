import { useEffect, useRef, useState } from "react";

function PaginationInput({ totalPages = 0, onChange, currentPage = 1 }) {
  if (totalPages <= 1) return <></>;
  const [current, setCurrent] = useState(currentPage);
  const refInput = useRef();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      let page = Number(e.target.value);

      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      setCurrent(page);
    }
  };

  useEffect(() => {
    onChange?.(current);
    refInput.current.value = current;
  }, [current]);

  useEffect(
    function () {
      setCurrent(currentPage);
    },
    [currentPage]
  );

  return (
    <div className="flex items-center gap-3 text-white w-fit">
      <button
        className="px-3 py-1 bg-proPurple rounded disabled:opacity-40"
        onClick={() => {
          if (current > 1) {
            const newPage = current - 1;
            setCurrent(newPage);
          }
        }}
        disabled={current <= 1}
      >
        Prev
      </button>

      <input
        ref={refInput}
        onKeyDown={handleKeyDown}
        className="w-14 text-center bg-primary border border-proPurple rounded py-1 outline-none"
      />

      <span>of {totalPages}</span>

      <button
        className="px-3 py-1 bg-proPurple rounded disabled:opacity-40"
        onClick={() => {
          if (current < totalPages) {
            const newPage = current + 1;
            setCurrent(newPage);
          }
        }}
        disabled={current >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default PaginationInput;
