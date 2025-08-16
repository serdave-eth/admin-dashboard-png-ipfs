'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Wallet } from 'lucide-react';

export default function LoginButton() {
  const { login, authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-4 py-3 rounded-lg font-medium"
      >
        <Wallet className="w-5 h-5" />
        Loading...
      </button>
    );
  }

  if (authenticated) {
    return null;
  }

  return (
    <button
      onClick={login}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
    >
      <Wallet className="w-5 h-5" />
      Connect Wallet
    </button>
  );
}