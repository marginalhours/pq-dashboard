import React, { useState, useRef, useEffect } from "react";
import { useQueues, useSettings, useItems, useDebounce } from "./hooks";
import { ItemsTable } from "./ItemsTable";
import { QueuesTable } from "./QueuesTable";
import { AppSettings } from "./AppSettings";
import { QueueName } from "./QueueName";
import { RefreshRatePicker } from "./RefreshRatePicker";
import { ToggleSwitch } from "./ToggleSwitch";
import {
  AppToastContainer,
  triggerDeleteItemToast,
  triggerDeleteProcessedToast,
  triggerDeleteQueuedToast,
  triggerRequeueItemToast,
} from "./AppToastContainer";

export const App: React.FunctionComponent = () => {
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [selectedQueue, setSelectedQueue] = useState(undefined);
  const [taskMode, setTaskMode] = useState(false);
  const [excludeProcessed, setExcludeProcessed] = useState(false);
  const [selectedTime, setSelectedTime] = useState(5);
  const [itemSortOrder, setItemSortOrder] = useState("enqueuedAt_ASC");
  const [itemSearch, setItemSearch] = useState("");
  const debouncedItemSearch = useDebounce(itemSearch, 500);
  const progressBar = useRef();

  const {
    queues,
    error: queuesError,
    onDeleteQueued,
    onDeleteProcessed,
    mutate: mutateQueues,
  } = useQueues();
  const {
    items,
    error: itemsError,
    onDeleteItem,
    onRequeueItem,
    mutate: mutateItems,
  } = useItems({
    limit: limit,
    offset: offset,
    selectedQueue: selectedQueue,
    excludeProcessed: excludeProcessed,
    orderBy: itemSortOrder,
    searchTerm: debouncedItemSearch,
  });
  const { settings, mutate: mutateSettings } = useSettings();

  useEffect(() => {
    setOffset(0);
  }, [selectedQueue, limit]);

  useEffect(() => {
    let handle;

    let start;
    let counter = 0;

    const loop = (dt) => {
      const delta = dt - start || 0;
      start = dt;
      counter += delta / 1000;

      if (progressBar.current) {
        progressBar.current.style.width = `${Math.min(
          (counter / selectedTime) * 100,
          100
        )}%`;
      }

      if (counter > selectedTime) {
        mutateQueues();
        mutateItems();
        mutateSettings();
        counter = 0;
      }

      handle = requestAnimationFrame(loop);
    };

    handle = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(handle);
    };
  }, [selectedTime]);

  const handleDeleteQueued = async (queueName) => {
    await onDeleteQueued(queueName);
    triggerDeleteQueuedToast(queueName);
    mutateItems();
  };

  const handleDeleteProcessed = async (queueName) => {
    await onDeleteProcessed(queueName);
    triggerDeleteProcessedToast(queueName);
    mutateItems();
  };

  const handleDeleteItem = async (itemId) => {
    await onDeleteItem(itemId);
    triggerDeleteItemToast(itemId);
  };

  const handleRequeueItem = async (itemId) => {
    await onRequeueItem(itemId);
    triggerRequeueItemToast(itemId);
  };

  const handleItemSearchChange = (event) => {
    setItemSearch(event.target.value);
  };

  return (
    <>
      <nav className="bg-gray-800 w-full h-12 relative inline-flex flex flex-row items-center justify-center">
        <span className="text-white font-mono font-bold bg-gray-900 rounded-full px-3 py-1 self-center justify-self-center">
          pq-dashboard
        </span>
        <span className="absolute right-3 top-3 text-white">
          <a
            className="underline"
            target="_blank"
            href="https://github.com/MisterKeefe/pq-dashboard"
          >
            github
          </a>
          <span className="inline-flex justify-center items-center h-4 w-4 align-middle">
            •
          </span>
          <a
            className="underline"
            target="_blank"
            href="https://pypi.org/project/pq-dashboard/"
          >
            pypi
          </a>
        </span>
        {!queuesError && !itemsError && (
          <span
            ref={progressBar}
            className="bg-green-500 inline-block w-1/2 absolute left-0"
            style={{ height: "3px", bottom: "-3px" }}
          ></span>
        )}
      </nav>
      {(queuesError || itemsError) && (
        <div className="w-full text-center text-white bg-red-500 p-2 transition ">
          Unable to access database. Please check your configuration.
        </div>
      )}
      <div className="bg-gray-100 w-full h-full p-0">
        <div className="p-4 m-4 bg-white rounded shadow flex flex-row">
          <div className="flex-1">
            <h2 className="text-xl mb-6 text-gray-700">Queues</h2>
            <QueuesTable
              queues={queues}
              onDeleteQueued={handleDeleteQueued}
              onDeleteProcessed={handleDeleteProcessed}
              selectedQueue={selectedQueue}
              onSelectQueue={setSelectedQueue}
            />
          </div>
          <div className="flex-initial">
            <AppSettings data={settings} />
          </div>
        </div>
        <div className="p-4 m-4 bg-white rounded shadow">
          <h2 className="text-xl mb-6 text-gray-700">
            Items in
            {selectedQueue && (
              <>
                {" "}
                queue <QueueName name={selectedQueue} />
              </>
            )}
            {selectedQueue == undefined && (
              <span className="font-bold text-gray-700"> all queues</span>
            )}
          </h2>
          <div className="flex flex-row w-full justify-between mb-2">
            <div className="self-start">
              <ToggleSwitch
                label="Show items as tasks"
                onToggle={() => setTaskMode(!taskMode)}
                toggled={taskMode}
              />
              <ToggleSwitch
                label="Hide processed items"
                onToggle={() => setExcludeProcessed(!excludeProcessed)}
                toggled={excludeProcessed}
              />
            </div>
            <div>
              <input
                type="text"
                className="w-64 px-2 py-1 focus:outline-none border rounded"
                value={itemSearch}
                onChange={handleItemSearchChange}
                placeholder="Search items..."
              />
              <div className="inline-block text-gray-400 relative -left-7 top-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="self-end">
              <RefreshRatePicker
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                times={[
                  ["1s", 1],
                  ["5s", 5],
                  ["10s", 10],
                  ["30s", 30],
                  ["1min", 60],
                  ["5min", 300],
                ]}
              />
            </div>
          </div>
          <ItemsTable
            items={items}
            limit={limit}
            offset={offset}
            setOffset={setOffset}
            setLimit={setLimit}
            selectedQueue={selectedQueue}
            taskMode={taskMode}
            sortOrder={itemSortOrder}
            onDeleteItem={handleDeleteItem}
            onRequeueItem={handleRequeueItem}
            onChangeSortOrder={setItemSortOrder}
          />
        </div>
      </div>
      <AppToastContainer />
    </>
  );
};
