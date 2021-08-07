import React from "react";

export const QueueName: React.FunctionComponent = ({ name, onClick }) => {
  return (
    <span
      className="border px-2 py-1 rounded bg-yellow-50 text-yellow-500 border-yellow-300 cursor-pointer select-none whitespace-nowrap"
      onClick={onClick}
    >
      <div className="inline-flex justify-center items-center pr-2 align-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      </div>
      {name}
    </span>
  );
};
