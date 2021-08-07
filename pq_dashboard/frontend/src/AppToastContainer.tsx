import React from "react";
import { ToastContainer, toast, Slide } from "react-toastify";

const contextClass = {
  success: "bg-green-500",
  error: "bg-red-600",
  info: "bg-yellow-400",
  warning: "bg-orange-400",
  default: "bg-indigo-600",
  dark: "bg-white-600 font-gray-300",
};

export const triggerDeleteQueuedToast = (queueName) => {
  toast.success(
    <span className="">
      Deleted queued items in queue{" "}
      <span className="font-bold">{queueName}</span>
    </span>,
    {
      autoClose: 2000,
      hideProgressBar: true,
    }
  );
};

export const triggerDeleteProcessedToast = (queueName) => {
  toast.success(
    <span className="">
      Deleted processed items in queue{" "}
      <span className="font-bold">{queueName}</span>
    </span>,
    { autoClose: 2000, hideProgressBar: true }
  );
};

export const triggerDeleteItemToast = (itemId) => {
  toast.success(
    <span className="whitespace-nowrap">
      Item <span className="font-bold">{itemId}</span> deleted
    </span>,
    { autoClose: 2000, hideProgressBar: true }
  );
};

export const triggerRequeueItemToast = (itemId) => {
  toast.info(
    <span className="whitespace-nowrap">
      Item <span className="font-bold">{itemId}</span> requeued
    </span>,
    { autoClose: 2000, hideProgressBar: true }
  );
};

export const AppToastContainer: React.FunctionComponent = () => {
  return (
    <ToastContainer
      toastClassName={({ type }) =>
        contextClass[type || "default"] +
        " relative flex p-1 min-h-10 rounded-md justify-between cursor-pointer my-2"
      }
      bodyClassName={() => "text-sm font-white font-med block p-3"}
      position="top-right"
      autoClose={2000}
      transition={Slide}
    />
  );
};
