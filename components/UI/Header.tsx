'use client';

import { usePrivy } from '@privy-io/react-auth';
import { truncateAddress } from '@/lib/utils';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { LogOut, Upload, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Header() {
  const { user, logout } = usePrivy();
  const { zoraWallet, hasZoraLinked } = useZoraLinking();
  const [copiedWallet, setCopiedWallet] = useState<'primary' | 'zora' | null>(null);
  
  // Handle both external and embedded wallets
  const walletAddress = user?.wallet?.address || 
    user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
    '';

  const copyToClipboard = async (address: string, type: 'primary' | 'zora') => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedWallet(type);
      toast.success(`${type === 'primary' ? 'Dashboard' : 'Zora'} wallet address copied!`);
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Upload className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            
            <nav className="hidden sm:flex items-center gap-4">
              <a
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </a>
              <a
                href="/coins"
                className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                Coins Explorer
              </a>
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Primary Wallet */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
              <Wallet className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {truncateAddress(walletAddress)}
              </span>
              <button
                onClick={() => copyToClipboard(walletAddress, 'primary')}
                className="p-0.5 text-gray-400 hover:text-gray-600 rounded"
                title="Copy dashboard wallet address"
              >
                {copiedWallet === 'primary' ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Zora Wallet */}
            {hasZoraLinked && zoraWallet && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full border border-purple-200">
                <svg className="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span className="text-sm text-purple-700">
                  {truncateAddress(zoraWallet.address)}
                </span>
                <button
                  onClick={() => copyToClipboard(zoraWallet.address, 'zora')}
                  className="p-0.5 text-purple-400 hover:text-purple-600 rounded"
                  title="Copy Zora wallet address"
                >
                  {copiedWallet === 'zora' ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            )}

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