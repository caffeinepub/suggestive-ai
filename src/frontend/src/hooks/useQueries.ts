import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "nova_api_key";

export function useGetApiKey() {
  return useQuery<string>({
    queryKey: ["apiKey"],
    queryFn: () => localStorage.getItem(STORAGE_KEY) ?? "",
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useStoreKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      localStorage.setItem(STORAGE_KEY, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
    },
  });
}

export function useRemoveKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem(STORAGE_KEY);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKey"] });
    },
  });
}
