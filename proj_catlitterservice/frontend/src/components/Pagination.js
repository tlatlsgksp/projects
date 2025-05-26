import React from "react";

const Pagination = ({ page, totalPages, onPageChange }) => {
  const maxVisible = 10;
  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // if near the end, shift start
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  return (
    <div className="flex justify-center mt-10 gap-2 flex-wrap">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        ◀ 이전
      </button>

      {start > 1 && (
        <button
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          1
        </button>
      )}
      {start > 2 && <span className="px-2 py-1 text-gray-400">...</span>}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded font-medium transition ${
            page === p
              ? "bg-green-500 text-white"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages - 1 && <span className="px-2 py-1 text-gray-400">...</span>}
      {end < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          {totalPages}
        </button>
      )}

      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        다음 ▶
      </button>
    </div>
  );
};

export default Pagination;