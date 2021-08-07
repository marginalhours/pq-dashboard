import useSWR from "swr";

const fetchQueues = async () => {
  const response = await fetch("/api/v1/queues/");

  if (response.status === 418) {
    throw "Unable to connect to DB";
  }

  const data = await response.json();
  return data;
};

const deleteQueuedItems = async (queueName: string) => {
  const response = await fetch(`/api/v1/queues/${queueName}/delete-queued`, {
    method: "POST",
  });
  return;
};

const deleteProcessedItems = async (queueName: string) => {
  const response = await fetch(`/api/v1/queues/${queueName}/delete-processed`, {
    method: "POST",
  });
  return;
};

export const useQueues = () => {
  const { data, mutate, error } = useSWR("queues", fetchQueues);

  const loading = !error && !data;

  const onDeleteQueued = async (queueName: string) => {
    await deleteQueuedItems(queueName);
    mutate();
  };

  const onDeleteProcessed = async (queueName: string) => {
    await deleteProcessedItems(queueName);
    mutate();
  };

  return {
    queues: data,
    mutate,
    error,
    loading,
    onDeleteQueued,
    onDeleteProcessed,
  };
};
