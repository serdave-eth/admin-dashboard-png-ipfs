'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import ContentFeed from '@/components/Content/ContentFeed';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { ArrowLeft, Users, TrendingUp, DollarSign } from 'lucide-react';

interface CreatorStats {
  name: string;
  symbol: string;
  description: string;
  marketCap: string;
  uniqueHolders: number;
  totalSupply: string;
  volume24h: string;
  yourBalance: string;
  yourBalanceDecimal: number;
}

export default function CreatorPage() {
  const { user } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const { zoraCoins, isLoadingCoins } = useZoraLinking();
  const [creatorStats, setCreatorStats] = useState<CreatorStats | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const creatorId = params?.id as string;
  const walletAddress = user?.wallet?.address || 
    user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
    '';

  useEffect(() => {
    if (!isLoadingCoins && zoraCoins.length > 0) {
      const creator = zoraCoins.find(coin => 
        coin.coin?.address === creatorId || coin.id === creatorId
      );
      
      if (creator) {
        setCreatorStats({
          name: creator.coin?.name || 'Unknown Creator',
          symbol: creator.coin?.symbol || '',
          description: creator.coin?.description || 'No description available',
          marketCap: creator.coin?.marketCap || '0',
          uniqueHolders: creator.coin?.uniqueHolders || 0,
          totalSupply: creator.coin?.totalSupply || '0',
          volume24h: creator.coin?.volume24h || '0',
          yourBalance: creator.balance,
          yourBalanceDecimal: creator.balanceDecimal || 0,
        });
      }
    }
  }, [zoraCoins, creatorId, isLoadingCoins]);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (isLoadingCoins) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Loading creator information...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!creatorStats) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
            <button
              onClick={() => router.push('/content')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to My Coins
            </button>
          </header>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-4">Creator not found</div>
              <button
                onClick={() => router.push('/content')}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to My Coins
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/content')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to My Coins
            </button>
            <div className="text-2xl font-bold text-gray-900">
              {creatorStats.name}
            </div>
            {creatorStats.symbol && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {creatorStats.symbol}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Creator Info Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Creator Description */}
              <div>
                <h2 className="text-xl font-bold mb-4">About This Creator</h2>
                <p className="text-gray-600 leading-relaxed">
                  {creatorStats.description.replace(/"/g, '')}
                </p>
              </div>
              
              {/* Your Holdings */}
              <div>
                <h2 className="text-xl font-bold mb-4">Your Holdings</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-700 font-medium">Your Balance:</span>
                    <span className="text-green-800 font-bold text-lg">
                      {creatorStats.yourBalanceDecimal.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Coin Owner
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Market Cap</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${parseFloat(creatorStats.marketCap).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Holders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {creatorStats.uniqueHolders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">24h Volume</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${parseFloat(creatorStats.volume24h || '0').toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Supply</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {parseFloat(creatorStats.totalSupply || '0').toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Exclusive Content Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Exclusive Content</h2>
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Access Granted - You own this creator's coins
              </div>
            </div>
            
            {/* Content Feed */}
            <ContentFeed 
              refreshTrigger={refreshTrigger} 
              creatorFilter={creatorId}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}