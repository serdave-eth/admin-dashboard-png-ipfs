'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterContextType {
  isReady: boolean;
  sdkContext: unknown;
}

const FarcasterContext = createContext<FarcasterContextType | undefined>(undefined);

export function useFarcaster() {
  const context = useContext(FarcasterContext);
  if (context === undefined) {
    throw new Error('useFarcaster must be used within a FarcasterProvider');
  }
  return context;
}

interface FarcasterProviderProps {
  children: ReactNode;
}

export function FarcasterProvider({ children }: FarcasterProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [sdkContext, setSdkContext] = useState<unknown>(null);

  useEffect(() => {
    async function initializeFarcaster() {
      try {
        // Initialize the Farcaster miniapp SDK
        await sdk.actions.ready();
        setIsReady(true);
        const context = await sdk.context;
        setSdkContext(context);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        // Even if SDK fails, allow app to continue
        setIsReady(true);
      }
    }

    initializeFarcaster();
  }, []);

  const value: FarcasterContextType = {
    isReady,
    sdkContext,
  };

  return (
    <FarcasterContext.Provider value={value}>
      {children}
    </FarcasterContext.Provider>
  );
}