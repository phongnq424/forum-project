import { useEffect, useState } from "react";

function PaginationInput({ currentPage = 1, totalPages = 0, onChange }) {
  if (totalPages === 0) return <></>;
  const [current, setCurrent] = useState(currentPage);
  const [currentView, setCurrentView] = useState(currentPage);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      let page = Number(currentView);

      if (isNaN(page) || page < 1) page = 1;
      if (page > totalPages) page = totalPages;

      setCurrent(page);
      setCurrentView(page);
    }
  };

  useEffect(() => {
    onChange?.(current);
  }, [current]);

  return (
    <div className="flex items-center gap-3 text-white w-fit">
      <button
        className="px-3 py-1 bg-proPurple rounded disabled:opacity-40"
        onClick={() => {
          if (current > 1) {
            const newPage = current - 1;
            setCurrent(newPage);
            setCurrentView(newPage);
          }
        }}
        disabled={current <= 1}
      >
        Prev
      </button>

      <input
        value={currentView}
        onChange={(e) => setCurrentView(e.target.value)}
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
            setCurrentView(newPage);
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
