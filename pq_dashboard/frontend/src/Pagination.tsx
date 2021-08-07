import React from "react";

type PaginationProps = {
  limit: number;
  offset: number;
  total: number;
  onSetOffset: (arg0: number) => void;
  onSetLimit: (arg0: number) => void;
  isAbove: boolean;
};

const SelectedButton: React.FunctionComponent = ({ number, isAbove }) => {
  return (
    <button
      className={
        "z-10 border-green-500 text-green-600 relative inline-flex items-center px-4 py-2 text-sm font-medium " +
        (isAbove ? " border-b-2 " : " border-t-2 ")
      }
    >
      {number}
    </button>
  );
};

const UnselectedButton: React.FunctionComponent = ({
  number,
  isAbove,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={
        "bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 text-sm font-medium " +
        (isAbove ? " border-b " : " border-t ")
      }
    >
      {number}
    </button>
  );
};

const Spacer: React.FunctionComponent = ({ isAbove }) => {
  return (
    <span
      className={
        "bg-white border-gray-300 text-gray-500 relative inline-flex items-center px-2 py-2 text-sm font-medium " +
        (isAbove ? " border-b " : " border-t ")
      }
    >
      …
    </span>
  );
};

const getPageButtons = ({
  maxPages,
  currentPage,
  isAbove,
  onSetOffset,
  pageSize,
}) => {
  const wingSize = 3;
  let startPage = Math.max(1, currentPage - wingSize);
  const endPage = Math.min(maxPages - 1, startPage + 2 * wingSize + 1);

  if (endPage === maxPages) {
    startPage = endPage - (2 * wingSize + 1);
  }

  const buttons = [];

  if (currentPage === 0) {
    buttons.push(<SelectedButton key="page-0" isAbove={isAbove} number={1} />);
  } else {
    buttons.push(
      <UnselectedButton
        key="page-0"
        isAbove={isAbove}
        number={1}
        onClick={() => onSetOffset(0)}
      />
    );
  }

  if (startPage === 2) {
    if (currentPage === 0) {
      buttons.push(
        <SelectedButton key="page-1" isAbove={isAbove} number={2} />
      );
    } else {
      buttons.push(
        <UnselectedButton
          key="page-1"
          isAbove={isAbove}
          number={2}
          onClick={() => onSetOffset(0)}
        />
      );
    }
  } else if (startPage > 2) {
    buttons.push(<Spacer isAbove={isAbove} key="start-spacer" />);
  }

  for (let i = startPage; i < endPage; i++) {
    if (i === currentPage) {
      buttons.push(
        <SelectedButton key={`page-${i}`} isAbove={isAbove} number={i + 1} />
      );
    } else {
      buttons.push(
        <UnselectedButton
          key={`page-${i}`}
          isAbove={isAbove}
          number={i + 1}
          onClick={() => onSetOffset(i * pageSize)}
        />
      );
    }
  }

  if (endPage === maxPages - 2) {
    if (currentPage === maxPages - 2) {
      buttons.push(
        <SelectedButton
          key={`page-${maxPages - 1}`}
          number={maxPages - 1}
          isAbove={isAbove}
        />
      );
    } else {
      buttons.push(
        <UnselectedButton
          key={`page-${maxPages - 1}`}
          number={maxPages - 1}
          isAbove={isAbove}
          onClick={() => onSetOffset((maxPages - 2) * pageSize)}
        />
      );
    }
  } else if (endPage < maxPages - 2) {
    buttons.push(<Spacer key="end-spacer" isAbove={isAbove} />);
  }

  if (maxPages > 1) {
    if (currentPage === maxPages - 1) {
      buttons.push(
        <SelectedButton
          key={`page-${maxPages}`}
          number={maxPages}
          isAbove={isAbove}
        />
      );
    } else {
      buttons.push(
        <UnselectedButton
          key={`page-${maxPages}`}
          number={maxPages}
          isAbove={isAbove}
          onClick={() => onSetOffset((maxPages - 1) * pageSize)}
        />
      );
    }
  }

  return buttons;
};

export const Pagination: React.FunctionComponent<PaginationProps> = ({
  limit,
  offset,
  total,
  onSetOffset,
  onSetLimit,
  isAbove,
}) => {
  const start = offset + 1;
  const end = Math.min(total, offset + limit);

  const pages = Math.ceil(total / limit);
  const currentPage = offset / limit;

  const handlePrevious = () => {
    onSetOffset(Math.max(0, offset - limit));
  };

  const handleNext = () => {
    if (currentPage < pages - 1) {
      onSetOffset(offset + limit);
    }
  };

  const handleLimitChange = (event) => {
    onSetLimit(parseInt(event.target.value));
  };

  return (
    <div className="flex-1 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-gray-400 text-s">
          Showing
          <span className="font-medium"> {start} </span>
          to
          <span className="font-medium"> {end} </span>
          of
          <span className="font-medium"> {total} </span>
        </span>
      </div>
      <div className="flex flex-row">
        <select
          value={limit}
          onChange={handleLimitChange}
          className="rounded bg-white text-gray-600 focus:outline-none"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
        <span className="text-gray-400 ml-2 inline-block">items per page</span>
      </div>
      <div>
        <nav
          className="relative z-0 inline-flex rounded-md -space-x-px"
          aria-label="Pagination"
        >
          <button
            onClick={handlePrevious}
            className="relative inline-flex items-center px-2 py-2 rounded-l-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Previous</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          {getPageButtons({
            maxPages: pages,
            currentPage,
            isAbove,
            onSetOffset,
            pageSize: limit,
          })}
          <button
            onClick={handleNext}
            className="relative inline-flex items-center px-2 py-2 rounded-r-md bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            <span className="sr-only">Next</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  );
};
