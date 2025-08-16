'use client';

import { useState, useEffect } from 'react';
import { getCoinsMostValuable } from '@zoralabs/coins-sdk';
import { TrendingUp, DollarSign, Users, Calendar, ExternalLink, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CoinData {
  id?: string;
  name?: string;
  symbol?: string;
  marketCap?: string;
  volume24h?: string;
  createdAt?: string;
  uniqueHolders?: number;
  address?: string;
}

interface TopValuableCoinsProps {
  count?: number;
}

export default function TopValuableCoins({ count = 10 }: TopValuableCoinsProps) {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMostValuableCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCoinsMostValuable({
        count,
        after: undefined,
      });

      if (response.data?.exploreList?.edges) {
        const coinData = response.data.exploreList.edges.map((edge: any) => edge.node);
        setCoins(coinData);
      } else {
        setCoins([]);
      }
    } catch (err) {
      console.error('Error fetching most valuable coins:', err);
      setError('Failed to fetch coins data');
      toast.error('Failed to fetch coins data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMostValuableCoins();
  }, [count]);

  const formatMarketCap = (marketCap: string) => {
    if (!marketCap) return 'N/A';
    const num = parseFloat(marketCap);
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatVolume = (volume: string) => {
    if (!volume) return 'N/A';
    const num = parseFloat(volume);
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const openZoraExplorer = (address: string) => {
    if (address) {
      window.open(`https://zora.co/coins/${address}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Top {count} Most Valuable Coins
          </h2>
          <div className="animate-spin">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Top {count} Most Valuable Coins
          </h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchMostValuableCoins}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Top {count} Most Valuable Coins
        </h2>
        <button
          onClick={fetchMostValuableCoins}
          disabled={loading}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {coins.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No coins data available
        </div>
      ) : (
        <div className="space-y-4">
          {coins.map((coin, index) => (
            <div
              key={coin.id || index}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {coin.name || 'Unknown Coin'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {coin.symbol || 'N/A'}
                    </p>
                  </div>
                </div>
                {coin.address && (
                  <button
                    onClick={() => openZoraExplorer(coin.address!)}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                    title="View on Zora"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-gray-500">Market Cap</p>
                    <p className="font-medium text-gray-900">
                      {formatMarketCap(coin.marketCap || '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-gray-500">24h Volume</p>
                    <p className="font-medium text-gray-900">
                      {formatVolume(coin.volume24h || '0')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-gray-500">Holders</p>
                    <p className="font-medium text-gray-900">
                      {coin.uniqueHolders?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(coin.createdAt || '')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
