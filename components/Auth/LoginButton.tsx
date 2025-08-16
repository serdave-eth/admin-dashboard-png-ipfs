'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoginButton() {
  const { login, logout, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  
  // Show as authenticated on Imagine creator page for demo purposes
  const isImagineCreatorPage = pathname === '/creator/imagine';
  const showAsAuthenticated = authenticated || isImagineCreatorPage;

  const handleConnect = async () => {
    setIsLoading(true);
    await login();
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await logout();
    setIsLoading(false);
  };

  if (!ready) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-500 px-6 py-2 rounded-full font-semibold text-sm cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  if (showAsAuthenticated) {
    return (
      <button
        onClick={handleDisconnect}
        disabled={isLoading}
        className="bg-black text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
      >
        {isLoading ? (
          <span>Disconnecting...</span>
        ) : (
          <span>Disconnect Wallet</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-black text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-gray-800 transition-colors"
    >
      {isLoading ? (
        <span>Connecting...</span>
      ) : (
        <span>Connect Wallet</span>
      )}
    </button>
  );
}