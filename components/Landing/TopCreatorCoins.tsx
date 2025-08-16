'use client';

import { useState, useEffect } from 'react';
import { getProfileBalances } from '@zoralabs/coins-sdk';

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

interface TopCreatorCoinsProps {
  onCreatorClick?: (creator: CoinBalance) => void;
}

export default function TopCreatorCoins({ onCreatorClick }: TopCreatorCoinsProps) {
  const [topCoins, setTopCoins] = useState<CoinBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopCoins();
  }, []);

  const fetchTopCoins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch top coins by market cap (we'll use a sample wallet to get popular coins)
      // In a real implementation, you'd want to fetch from a dedicated top coins endpoint
      const response = await getProfileBalances({
        identifier: '0x1234567890123456789012345678901234567890', // Sample wallet
        count: 10,
      });

      const profile = response.data?.profile;
      if (profile && profile.coinBalances?.edges) {
        const coins = profile.coinBalances.edges
          .map(edge => edge.node)
          .filter(coin => coin.coin?.marketCap)
          .sort((a, b) => {
            const aMarketCap = parseFloat(a.coin?.marketCap || '0');
            const bMarketCap = parseFloat(b.coin?.marketCap || '0');
            return bMarketCap - aMarketCap;
          })
          .slice(0, 10);
        
        setTopCoins(coins);
      }
    } catch (err) {
      console.error('Failed to fetch top coins:', err);
      setError('Failed to load top creator coins');
      // Set sample data for demo purposes
      setTopCoins([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Top Creator Coins</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold mb-4">Top Creator Coins</h3>
        <div className="text-red-600 text-center py-8">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Top Creator Coins</h3>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {topCoins.length > 0 ? (
          topCoins.map((coinBalance, index) => (
            <div 
              key={coinBalance.id || index}
              className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onCreatorClick?.(coinBalance)}
            >
              <div className="flex flex-col h-full">
                <h4 className="font-semibold text-gray-900 truncate">
                  {coinBalance.coin?.name || 'Unknown Coin'}
                </h4>
                {coinBalance.coin?.symbol && (
                  <p className="text-sm text-gray-600 mb-2">
                    {coinBalance.coin.symbol}
                  </p>
                )}
                {coinBalance.coin?.marketCap && (
                  <p className="text-sm text-gray-700 mb-1">
                    Market Cap: ${parseFloat(coinBalance.coin.marketCap).toLocaleString()}
                  </p>
                )}
                {coinBalance.coin?.uniqueHolders && (
                  <p className="text-sm text-gray-600">
                    Holders: {coinBalance.coin.uniqueHolders}
                  </p>
                )}
                <div className="mt-auto pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((coinBalance.coin?.uniqueHolders || 0) / 100 * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Sample data for demo
          [...Array(5)].map((_, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onCreatorClick?.({
                id: `sample-${index}`,
                balance: '0',
                coin: {
                  name: `Creator ${index + 1}`,
                  symbol: `CRT${index + 1}`,
                  marketCap: String((Math.random() * 100000).toFixed(2)),
                  uniqueHolders: Math.floor(Math.random() * 1000)
                }
              })}
            >
              <div className="flex flex-col h-full">
                <h4 className="font-semibold text-gray-900 truncate">
                  Creator {index + 1}
                </h4>
                <p className="text-sm text-gray-600 mb-2">CRT{index + 1}</p>
                <p className="text-sm text-gray-700 mb-1">
                  Market Cap: ${(Math.random() * 100000).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Holders: {Math.floor(Math.random() * 1000)}
                </p>
                <div className="mt-auto pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}