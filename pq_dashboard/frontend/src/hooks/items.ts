import useSWR from "swr";

const genericFetch = async (url) => {
  const response = await fetch(url);

  if (response.status === 418) {
    throw "Unable to connect to DB";
  }

  const data = await response.json();
  return data;
};

const deleteItem = async (itemId: number) => {
  const response = await fetch(`/api/v1/items/${itemId}`, { method: "DELETE" });
  return;
};

const requeueItem = async (itemId: number) => {
  const response = await fetch(`/api/v1/items/${itemId}/requeue`, {
    method: "POST",
  });
  const data = response.json();
  return data;
};

export const useItems = ({
  limit,
  offset,
  selectedQueue,
  excludeProcessed,
  orderBy,
  searchTerm,
}) => {
  const params = new URLSearchParams({
    limit: limit,
    offset: offset,
    exclude_processed: excludeProcessed,
    order_by: orderBy,
  });

  if (selectedQueue != undefined) {
    params.append("queue", selectedQueue);
  }

  if (searchTerm?.length > 0) {
    params.append("search", searchTerm);
  }

  const { data, mutate, error } = useSWR(
    `/api/v1/items/?` + params,
    genericFetch
  );

  const onDeleteItem = async (itemId) => {
    mutate(
      {
        ...data,
        records: data.records.filter((item) => item.id != itemId),
      },
      false
    );
    await deleteItem(itemId);
    mutate();
  };

  const onRequeueItem = async (itemId) => {
    await requeueItem(itemId);
    mutate();
  };

  const loading = !error && !data;

  return { items: data, mutate, error, loading, onDeleteItem, onRequeueItem };
};
