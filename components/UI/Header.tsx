'use client';

import { usePrivy } from '@privy-io/react-auth';
import { truncateAddress } from '@/lib/utils';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { LogOut, Upload, Wallet, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { user, logout, authenticated, ready, login } = usePrivy();
  const { zoraWallet, hasZoraLinked } = useZoraLinking();
  const [copiedWallet, setCopiedWallet] = useState<'primary' | 'zora' | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Check if we're on a creator page (for styling adjustments)
  const isCreatorPage = pathname?.startsWith('/creator/');
  
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
    <header className={isCreatorPage ? "bg-white border-b border-gray-200 sticky top-0 z-10" : "bg-white border-b border-gray-200 sticky top-0 z-10"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-black tracking-tight cursor-pointer hover:text-gray-700 transition-colors"
            >
              Backstage
            </h1>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => router.push('/explore')}
              className={`font-medium transition-colors ${
                pathname === '/explore' ? 'text-blue-600' : 'text-black hover:text-gray-600'
              }`}
            >
              Explore
            </button>
            {authenticated && (
              <button
                onClick={() => router.push('/dashboard')}
                className={`font-medium transition-colors ${
                  pathname === '/dashboard' ? 'text-blue-600' : 'text-black hover:text-gray-600'
                }`}
              >
                Dashboard
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            
            {!ready ? (
              /* Loading state */
              <div className="animate-pulse bg-black/10 h-10 w-32 rounded-full"></div>
            ) : !authenticated ? (
              /* Not authenticated - show connect wallet button */
              <button
                onClick={login}
                className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <>
                {/* Authenticated - show wallet info and logout */}
                {/* Primary Wallet */}
                <div className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full border border-black/20 hover:scale-105 transition-all duration-200">
                  <Wallet className="w-4 h-4 text-black" />
                  <span className="text-sm text-black font-bold">
                    {truncateAddress(walletAddress)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(walletAddress, 'primary')}
                    className="p-0.5 text-black/60 hover:text-black rounded hover:scale-110 transition-all duration-200"
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
                  <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-full border border-purple-500/30 hover:scale-105 transition-all duration-200">
                    <svg className="w-4 h-4 text-purple-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <span className="text-sm text-purple-800 font-bold">
                      {truncateAddress(zoraWallet.address)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(zoraWallet.address, 'zora')}
                      className="p-0.5 text-purple-600 hover:text-purple-800 rounded hover:scale-110 transition-all duration-200"
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
                  className="flex items-center gap-2 bg-black/10 px-4 py-2 rounded-full border border-black/20 text-black hover:bg-black hover:text-yellow-400 transition-all duration-200 hover:scale-105"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline font-bold">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}