import useSWR from "swr";

const fetchSettings = async () => {
  const response = await fetch("/api/v1/health/config");
  const data = await response.json();
  return data;
};

export const useSettings = () => {
  const { data, mutate, error } = useSWR("settings", fetchSettings);

  const loading = !error && !data;

  return { settings: data, mutate, error, loading };
};
