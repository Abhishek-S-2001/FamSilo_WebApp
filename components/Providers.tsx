'use client';

import { useEffect } from 'react';
import { SWRConfig } from 'swr';
import { ChatProvider } from '@/lib/context/ChatContext';
import { startKeepAlive } from '@/lib/keepAlive';

export default function Providers({ children }: { children: React.ReactNode }) {
  
  // Start your keep-alive ping
  useEffect(() => { 
    startKeepAlive(); 
  }, []);

  return (
    <SWRConfig value={{
      shouldRetryOnError: (error) => {
        const status = error?.response?.status;
        // Never retry auth errors — redirect handles it
        return status !== 401 && status !== 422;
      },
    }}>
      <ChatProvider>
        {children}
      </ChatProvider>
    </SWRConfig>
  );
}