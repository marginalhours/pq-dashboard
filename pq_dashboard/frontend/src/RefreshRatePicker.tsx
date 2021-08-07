import React from "react";

export const RefreshRatePicker: React.FunctionComponent = ({
  times,
  selectedTime,
  onSelectTime,
}) => {
  return (
    <div className="flex flex-row">
      <span className="mr-2">Refresh every</span>
      {times.map(([label, time]) => (
        <span
          key={`refresh-${label}`}
          className={
            "transition-color select-none rounded text-xs px-1.5 py-0.5 mx-0.5 inline-flex justify-center items-center" +
            (time === selectedTime
              ? " bg-green-500 text-white "
              : " bg-gray-200 text-gray-400 cursor-pointer ")
          }
          onClick={() => onSelectTime(time)}
        >
          {label}
        </span>
      ))}
    </div>
  );
};
