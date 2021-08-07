import React from "react";
import { QueueName } from "./QueueName";

type Queue = {
  name: string;
  total: number;
  processed: number;
  queued: number;
};

type QueuesTableProps = {
  queues: Array<Queue>;
  selectedQueue: string;
  onDeleteQueued: (arg0: string) => void;
  onDeleteProcessed: (arg0: string) => void;
  onSelectQueue: (arg0: string) => void;
};

export const QueuesTable: React.FunctionComponent<QueuesTableProps> = ({
  queues,
  selectedQueue,
  onDeleteQueued,
  onDeleteProcessed,
  onSelectQueue,
}) => {
  const handleQueueNameClick = (name: string) => {
    if (name === selectedQueue) {
      onSelectQueue(undefined);
    } else {
      onSelectQueue(name);
    }
  };

  const sortedQueues = queues?.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (b.name > a.name) {
      return 1;
    }
    return 0;
  });

  return (
    <table className="table-auto text-center w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Queued
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Processed
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedQueues &&
          sortedQueues.map((queue) => (
            <tr
              key={`queue-${queue.name}`}
              className={
                queue.name === selectedQueue
                  ? " border-l border-yellow-300 bg-yellow-50"
                  : "border-b border-gray-100 "
              }
            >
              <td className="px-4 py-4">
                <QueueName
                  name={queue.name}
                  onClick={() => handleQueueNameClick(queue.name)}
                />
              </td>
              <td className="px-6 py-4">{queue.queued}</td>
              <td className="px-6 py-4">{queue.processed}</td>
              <td className="px-6 py-4">{queue.total}</td>
              <td>
                <div className="flex flex-row items-center justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white text-sm py-1 px-3 rounded-full mx-2"
                    onClick={async () => onDeleteQueued(queue.name)}
                  >
                    Cancel queued items
                  </button>
                  <button
                    className="border border-green-500 hover:bg-green-500 hover:text-white text-green-600 text-sm py-1 px-3 rounded-full mx-2"
                    onClick={async () => onDeleteProcessed(queue.name)}
                  >
                    Cleanup processed items
                  </button>
                </div>
              </td>
            </tr>
          ))}
        {!queues && (
          <tr key={`item-empty-table`}>
            <td colSpan={8} className="pt-4 text-center text-gray-400">
              No data
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};
