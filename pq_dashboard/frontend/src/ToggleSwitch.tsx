import React from "react";

export const ToggleSwitch = ({ label, onToggle, toggled }) => {
  return (
    <label
      htmlFor={`toggle-0`}
      className="inline-flex justify-between items-between cursor-pointer mr-4"
      onClick={onToggle}
    >
      <div className="font-medium mr-2">{label}</div>
      <div className="relative flex items-center">
        <div
          className={
            "w-10 h-5 rounded-full shadow-inner transition-colors " +
            (toggled ? " bg-green-400" : " bg-gray-300")
          }
        ></div>
        <div
          className={
            "absolute w-4 h-4 bg-white rounded-full top-1.0 left-0.5 shadow transition transform " +
            (toggled ? "translate-x-5" : "")
          }
        ></div>
      </div>
    </label>
  );
};
