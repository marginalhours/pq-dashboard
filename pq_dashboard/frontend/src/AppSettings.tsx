import React from "react";
import { ToggleSwitch } from "./ToggleSwitch";

type AppSettingsProps = {
  data: {
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DATABASE: string;
    QUEUE_TABLE: string;
  };
  setTaskMode: () => void;
  taskMode: boolean;
  setShowProcessed: () => void;
  showProcessed: boolean;
};

export const AppSettings: React.FunctionComponent<AppSettingsProps> = ({
  data,
}) => {
  const dt_classes =
    "inline-block border rounded-l p-2 text-center uppercase text-xs mb-2 bg-gray-50 text-gray-600";
  const dd_classes =
    "inline-block border border-l-0 rounded-r p-2 text-center text-xs mb-2 text-gray-600 font-bold";

  return (
    <div className="w-80 mx-4">
      <h2 className="text-xl mb-4">Configuration</h2>
      {data != undefined && (
        <dl className="grid grid-cols-2">
          <dt className={dt_classes}>Server Address</dt>
          <dd className={dd_classes}>
            {data.PGHOST}:{data.PGPORT}
          </dd>
          <dt className={dt_classes}>User</dt>
          <dd className={dd_classes}>{data.PGUSER}</dd>
          <dt className={dt_classes}>Database</dt>
          <dd className={dd_classes}>{data.DATABASE}</dd>
          <dt className={dt_classes}>Queue Table</dt>
          <dd className={dd_classes}>{data.QUEUE_TABLE}</dd>
        </dl>
      )}
    </div>
  );
};
