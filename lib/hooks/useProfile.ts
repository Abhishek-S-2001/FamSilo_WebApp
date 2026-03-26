import useSWR from 'swr';
import api from '@/lib/axios';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR('/users/me', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30000, // cache for 30 seconds
  });

  return {
    profile: data?.profile ?? null,
    stats: data?.stats ?? { silos_joined: 0, known_members: 0, media_posts: 0 },
    silosList: data?.silos_list ?? [],
    membersList: data?.members_list ?? [],
    isLoading,
    isError: !!error,
    mutate, // call this after saving edits to refresh data
  };
}