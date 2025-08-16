'use client';

import { usePrivy } from '@privy-io/react-auth';
import { truncateAddress } from '@/lib/utils';
import { LogOut, Upload } from 'lucide-react';

export default function Header() {
  const { user, logout } = usePrivy();
  const walletAddress = user?.wallet?.address || '';

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Upload className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {truncateAddress(walletAddress)}
            </span>
            <button
              onClick={() => logout()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}