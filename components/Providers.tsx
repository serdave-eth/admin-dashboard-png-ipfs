'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { Toaster } from 'sonner';
import { privyConfig } from '@/lib/privy';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
    >
      {children}
      <Toaster position="bottom-right" />
    </PrivyProvider>
  );
}