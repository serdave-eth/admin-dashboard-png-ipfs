'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { Toaster } from 'sonner';
import { privyConfig } from '@/lib/privy';
import { FarcasterProvider } from './FarcasterProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FarcasterProvider>
      <PrivyProvider
        appId={privyConfig.appId}
        config={privyConfig.config}
      >
        {children}
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: { width: 'auto', minWidth: '120px', maxWidth: '200px' }
          }}
        />
      </PrivyProvider>
    </FarcasterProvider>
  );
}