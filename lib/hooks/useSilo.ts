import useSWR from 'swr';
import api from '@/lib/axios';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export function useSilo(siloId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    siloId ? `/silos/${siloId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
    }
  );

  return {
    silo: data?.silo ?? null,
    members: data?.members ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}