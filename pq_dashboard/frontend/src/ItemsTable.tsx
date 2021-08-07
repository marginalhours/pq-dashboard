import React, { useState, useEffect } from "react";
import ReactJson from "react-json-view";
import TimeAgo from "react-timeago";
import jp from "jsonpath";
import { Pagination } from "./Pagination";
import { QueueName } from "./QueueName";

const formatDate = (date: string) => {
  if (date === undefined || date === null) {
    return "";
  }
  let d = new Date(date).toISOString();
  d = d.replace("T", " ");
  return d.substring(0, d.length - 5);
};

const DateTimeWithRelative = ({ date }: { date: string }) => {
  return (
    <>
      {date && (
        <p>
          <TimeAgo date={date} />
        </p>
      )}
      {date && (
        <span className="text-gray-600 text-xs whitespace-nowrap">
          ({formatDate(date)})
        </span>
      )}
    </>
  );
};

const applyDataQuery = (data, query) => {
  if (query === "") {
    return data;
  }

  try {
    return jp.query(data, query)[0];
  } catch (err) {
    return data;
  }
};

const DataCell = ({ data, query }) => {
  const queryResult = applyDataQuery(data, query);

  if (typeof queryResult === "string" || typeof queryResult === "number") {
    return (
      <span className="inline-block w-full text-center font-mono">
        {queryResult}
      </span>
    );
  } else {
    return (
      <ReactJson
        src={applyDataQuery(data, query)}
        collapsed={true}
        name={false}
      />
    );
  }
};

type ItemsTableProps = {
  items: any;
  limit: number;
  offset: number;
  selectedQueue: string;
  taskMode: boolean;
  sortOrder: string;
  setOffset: (arg0: number) => void;
  setLimit: (arg0: number) => void;
  onDeleteItem: (itemId: number) => void;
  onRequestItem: (itemId: number) => void;
  onChangeSortOrder: (order: string) => void;
};

export const ItemsTable: React.FunctionComponent<ItemsTableProps> = ({
  items,
  limit,
  offset,
  setOffset,
  setLimit,
  taskMode,
  sortOrder,
  onDeleteItem,
  onRequeueItem,
  onChangeSortOrder,
}) => {
  const records = items?.records;

  return (
    <>
      <div className="mb-4">
        <Pagination
          limit={limit}
          offset={offset}
          total={items?.total}
          onSetOffset={setOffset}
          onSetLimit={setLimit}
          isAbove={true}
        />
      </div>
      {!taskMode && (
        <DefaultTable
          records={records}
          sortOrder={sortOrder}
          onDeleteItem={onDeleteItem}
          onRequeueItem={onRequeueItem}
          onChangeSortOrder={onChangeSortOrder}
        />
      )}
      {taskMode && (
        <TasksTable
          records={records}
          sortOrder={sortOrder}
          onDeleteItem={onDeleteItem}
          onRequeueItem={onRequeueItem}
          onChangeSortOrder={onChangeSortOrder}
        />
      )}
      <div className="mt-4">
        <Pagination
          limit={limit}
          offset={offset}
          total={items?.total}
          onSetOffset={setOffset}
          isAbove={false}
        />
      </div>
    </>
  );
};

const TaskActions = ({ onDeleteItem, onRequeueItem, item }) => {
  return (
    <div className="flex flex-row flex-nowrap">
      <button
        className="border border-green-500 hover:bg-green-500 hover:text-white text-green-600 text-sm py-1 px-3 rounded-full mx-2"
        onClick={async () => onDeleteItem(item.id)}
      >
        {item.dequeued_at != undefined ? "Remove" : "Cancel"}
      </button>
      {item.dequeued_at != undefined && (
        <button
          className="border border-yellow-400 hover:bg-yellow-400 hover:text-white text-yellow-500 text-sm py-1 px-3 rounded-full mx-2"
          onClick={async () => onRequeueItem(item.id)}
        >
          Requeue
        </button>
      )}
    </div>
  );
};

const ChevronUp = ({ bold }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke={bold ? "#6B7280" : "#9CA3AF"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={bold ? 3 : 2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
};

const ChevronDown = ({ bold }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      fill="none"
      viewBox="0 0 24 24"
      stroke={bold ? "#6B7280" : "#9CA3AF"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={bold ? 3 : 2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
};

const OrderHeading = ({
  currentOrder,
  upOrder,
  downOrder,
  title,
  onChangeOrder,
}) => {
  const changeOrder = () => {
    switch (currentOrder) {
      case upOrder:
        onChangeOrder(downOrder);
        break;
      case downOrder:
        onChangeOrder(upOrder);
        break;
      default:
        onChangeOrder(downOrder);
        break;
    }
  };
  return (
    <div
      className="flex flex-row items-center justify-center select-none whitespace-nowrap cursor-pointer"
      onClick={changeOrder}
    >
      {title}
      <div className="flex flex-col ml-2">
        <ChevronUp bold={currentOrder == upOrder} />
        <ChevronDown bold={currentOrder == downOrder} />
      </div>
    </div>
  );
};

const DefaultTable = ({
  records,
  onDeleteItem,
  onRequeueItem,
  onChangeSortOrder,
  sortOrder,
}) => {
  const [dataQuery, setDataQuery] = useState("");

  const handleDataQueryChange = (event) => {
    setDataQuery(event.target.value);
  };

  return (
    <table className="table-fixed text-center w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Enqueued At"
              upOrder="enqueuedAt_ASC"
              downOrder="enqueuedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Dequeued At"
              upOrder="dequeuedAt_ASC"
              downOrder="dequeuedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Expected At"
              upOrder="expectedAt_ASC"
              downOrder="expectedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Schedule At"
              upOrder="scheduleAt_ASC"
              downOrder="scheduleAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Queue"
              upOrder="queue_ASC"
              downOrder="queue_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider flex flex-col">
            <span className="inline-block mb-2">Data</span>
            <input
              type="text"
              className="p-2"
              value={dataQuery}
              onChange={handleDataQueryChange}
              placeholder="JSONPath query..."
            />
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {records &&
          records.map((item) => (
            <tr
              key={`item-${item.id}`}
              className="border-b border-gray-100 text-sm"
            >
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.enqueued_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.dequeued_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.expected_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.scheduled_at} />
              </td>
              <td className="px-4 py-2">
                <QueueName name={item.q_name} />
              </td>
              <td className="px-4 py-2 text-left">
                <DataCell data={item.data} query={dataQuery} />
              </td>
              <td>
                <TaskActions
                  onDeleteItem={onDeleteItem}
                  onRequeueItem={onRequeueItem}
                  item={item}
                />
              </td>
            </tr>
          ))}
        {!records && (
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

const TasksTable = ({
  records,
  sortOrder,
  onDeleteItem,
  onRequeueItem,
  onChangeSortOrder,
}) => {
  return (
    <table className="table text-center w-full">
      <thead className="bg-gray-100">
        <tr>
          <th className="w-16 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            ID
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Enqueued At"
              upOrder="enqueuedAt_ASC"
              downOrder="enqueuedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Dequeued At"
              upOrder="dequeuedAt_ASC"
              downOrder="dequeuedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Expected At"
              upOrder="expectedAt_ASC"
              downOrder="expectedAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="w-44 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Schedule At"
              upOrder="scheduleAt_ASC"
              downOrder="scheduleAt_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <OrderHeading
              title="Queue"
              upOrder="queue_ASC"
              downOrder="queue_DESC"
              currentOrder={sortOrder}
              onChangeOrder={onChangeSortOrder}
            />
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Function
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Args
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Kwargs
          </th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Retries
          </th>
          <th className="w-48 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider flex flex-row flex-wrap">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {records &&
          records.map((item) => (
            <tr
              key={`item-${item.id}`}
              className="border-b border-gray-100 text-sm"
            >
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.enqueued_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.dequeued_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.expected_at} />
              </td>
              <td className="px-4 py-2">
                <DateTimeWithRelative date={item.scheduled_at} />
              </td>
              <td className="px-4 py-2">
                <QueueName name={item.q_name} />
              </td>
              <td className="px-4 py-2 text-left">
                <span className="font-mono">{item.data?.function}</span>
              </td>
              <td className="px-4 py-2 text-center">
                <span className="font-mono">
                  {JSON.stringify(item.data?.args)}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <span className="font-mono">
                  {JSON.stringify(item.data?.kwargs)}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                <span>{item.data.retried}</span>
              </td>
              <td>
                <TaskActions
                  onDeleteItem={onDeleteItem}
                  onRequeueItem={onRequeueItem}
                  item={item}
                />
              </td>
            </tr>
          ))}
        {!records && (
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
