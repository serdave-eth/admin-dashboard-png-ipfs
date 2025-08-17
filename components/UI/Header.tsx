'use client';

import { usePrivy } from '@privy-io/react-auth';
import { truncateAddress } from '@/lib/utils';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { LogOut, Wallet, Copy, Check, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout, authenticated, ready, login } = usePrivy();
  const { zoraWallet, hasZoraLinked } = useZoraLinking();
  const [copiedWallet, setCopiedWallet] = useState<'primary' | 'zora' | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={isCreatorPage ? "bg-white border-b border-gray-200 sticky top-0 z-50" : "bg-white border-b border-gray-200 sticky top-0 z-50"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <h1 
              onClick={() => router.push('/?from=logo')}
              className="text-2xl font-bold text-black tracking-tight cursor-pointer hover:text-gray-700 transition-colors"
            >
              Backstage
            </h1>
          </div>
          
          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
          </div>
          
          <div className="flex items-center gap-3">
            
            {!ready ? (
              /* Loading state */
              <div className="animate-pulse bg-black/10 h-10 w-32 rounded-full"></div>
            ) : !authenticated ? (
              /* Not authenticated - show connect wallet button */
              <button
                onClick={login}
                className="bg-black text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Log in
              </button>
            ) : (
              <>
                {/* Authenticated - show wallet info with dropdown */}
                <div className="relative" ref={dropdownRef}>
                  {/* Primary Wallet */}
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4 text-white" />
                    <span className="text-sm text-white font-bold">
                      {truncateAddress(walletAddress)}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[100]">
                      <button
                        onClick={() => {
                          router.push('/dashboard');
                          setDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors cursor-pointer ${
                          pathname === '/dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                        </svg>
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          copyToClipboard(walletAddress, 'primary');
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        {copiedWallet === 'primary' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        Copy Address
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log out
                      </button>
                    </div>
                  )}
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

              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}