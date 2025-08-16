'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import TopCreatorCoins from '@/components/Landing/TopCreatorCoins';

interface CoinBalance {
  id: string;
  balance: string;
  balanceDecimal?: number;
  decimals?: number;
  coin?: {
    id?: string;
    name?: string;
    description?: string;
    address?: string;
    symbol?: string;
    totalSupply?: string;
    totalVolume?: string;
    volume24h?: string;
    marketCap?: string;
    marketCapDelta24h?: string;
    uniqueHolders?: number;
    createdAt?: string;
    creatorAddress?: string;
    tokenUri?: string;
    mediaContent?: {
      mimeType?: string;
      originalUri?: string;
      previewImage?: {
        small?: string;
        medium?: string;
        blurhash?: string;
      };
    };
  };
}

export default function Home() {
  const { login, logout, authenticated, ready, user } = usePrivy();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (authenticated) {
      router.push('/content');
    }
  }, [authenticated, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleCreatorClick = (creator: CoinBalance) => {
    // For now, just navigate to content page
    // Later we'll implement creator-specific pages
    if (authenticated) {
      router.push('/content');
    } else {
      login();
    }
  };

  const WalletConnectButton = () => {
    if (!ready) {
      return (
        <button
          disabled
          className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-6 py-2 rounded-lg font-medium"
        >
          <Wallet className="w-5 h-5" />
          Loading...
        </button>
      );
    }

    if (authenticated) {
      const walletAddress = user?.wallet?.address || 
        user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
        '';
      
      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowUserMenu(!showUserMenu);
            }}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Wallet className="w-4 h-4" />
            {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <button
                onClick={() => {
                  router.push('/content');
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </button>
              <hr className="my-1" />
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={login}
        className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header with Wallet Connect */}
      <header className="w-full px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-900">
          OnlyCoins
        </div>
        <WalletConnectButton />
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Exclusive Creator Content Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with your favorite creators through exclusive content unlocked by holding their coins
          </p>
        </div>

        {/* Top Creator Coins Section */}
        <div className="mb-16">
          <TopCreatorCoins onCreatorClick={handleCreatorClick} />
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your creator coins and access exclusive content
          </p>
          <WalletConnectButton />
        </div>
      </div>
    </main>
  );
}