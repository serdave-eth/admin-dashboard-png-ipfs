'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';
import { useState } from 'react';

export default function LoginButton() {
  const { login, authenticated, ready } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    await login();
    setIsLoading(false);
  };

  if (!ready) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-black/10 text-black/40 px-8 py-4 rounded-full font-bold text-lg border border-black/20"
      >
        <div className="w-4 h-4 border-2 border-black/30 border-t-black/70 rounded-full animate-spin" />
        Loading...
      </button>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isLoading}
      className="w-full relative bg-black text-yellow-400 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-200 shadow-lg"
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Wallet className="w-5 h-5" />
          <span>Connect Wallet</span>
        </div>
      )}
    </button>
  );
}