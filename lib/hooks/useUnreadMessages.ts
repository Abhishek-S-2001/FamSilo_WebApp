import useSWR from 'swr';
import api from '@/lib/axios';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export function useUnreadMessages() {
  const { data } = useSWR('/chat/inbox', fetcher, {
    refreshInterval: 15000,      // poll every 15s
    revalidateOnFocus: true,     // re-check when user returns to tab
    dedupingInterval: 10000,
  });

  const totalUnread = (data ?? []).reduce(
    (sum: number, chat: any) => sum + (chat.unread_count || 0), 0
  );

  return { hasUnread: totalUnread > 0 };
}