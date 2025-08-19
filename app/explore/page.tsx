'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, Users, TrendingUp, Coins } from 'lucide-react';
import Image from 'next/image';
import { getCoin } from '@zoralabs/coins-sdk';
import { usePrivy } from '@privy-io/react-auth';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';

interface Creator {
  id: string;
  name: string;
  symbol: string;
  address: string;
  marketCap?: string;
  holders?: number;
  volume24h?: string;
  marketCapDelta24h?: string;
  imageUrl?: string;
  contentCount?: number;
  userBalance?: number;
}

export default function ExplorePage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, authenticated } = usePrivy();
  const { zoraCoins, hasZoraLinked, zoraWallet } = useZoraLinking();

  // Fetch creator addresses from database
  const fetchCreatorAddresses = async (): Promise<string[]> => {
    try {
      const response = await fetch('/api/content/creators');
      const data = await response.json();
      return data.creators || [];
    } catch (error) {
      console.error('Failed to fetch creator addresses:', error);
      // Fallback to hardcoded addresses if API fails
      return [
        '0x024d3b7fb4917d030d097d76925a6c0531cd0623', // Serdave-eth
        '0x7a0cc651e7b92b273b51c0dbc7db6056822f073b', // maariab
        '0x0f04832da0070c834112209f7f4d56417869172d', // franklen
      ];
    }
  };

  // Fetch real creator data from Zora API
  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      // First fetch the list of creators from our database
      const targetAddresses = await fetchCreatorAddresses();
      
      if (targetAddresses.length === 0) {
        setCreators([]);
        setLoading(false);
        return;
      }

      // Fetch all content counts in one request
      let contentCounts: Record<string, number> = {};
      try {
        const countsResponse = await fetch('/api/content/creators/counts');
        const countsData = await countsResponse.json();
        contentCounts = countsData.counts || {};
      } catch (error) {
        console.error('Failed to fetch content counts:', error);
      }

      // Process in smaller batches to avoid overwhelming the API
      const batchSize = 3;
      const allCreators: Creator[] = [];
      
      for (let i = 0; i < targetAddresses.length; i += batchSize) {
        const batch = targetAddresses.slice(i, i + batchSize);
        const batchPromises = batch.map(async (address) => {
          try {
            const response = await getCoin({ address });
            const coin = response.data?.zora20Token;
            
            if (coin) {
              // Get content count from pre-fetched data
              const contentCount = contentCounts[coin.address] || 0;
              
              // Get user balance for this coin
              const userCoin = zoraCoins.find(zc => 
                zc.coin?.address?.toLowerCase() === coin.address?.toLowerCase()
              );
              const userBalance = userCoin?.balanceDecimal || 0;

              return {
                id: coin.address,
                name: coin.name || 'Unknown Creator',
                symbol: coin.symbol || 'UNKNOWN',
                address: coin.address,
                marketCap: coin.marketCap || '0',
                holders: coin.uniqueHolders || 0,
                volume24h: coin.volume24h || '0',
                marketCapDelta24h: '0', // Not available in API response
                imageUrl: coin.mediaContent?.previewImage?.medium || 
                         coin.mediaContent?.previewImage?.small || 
                         `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.name}&backgroundColor=b6e3f4`,
                contentCount: contentCount, // Real content count from database
                userBalance: userBalance, // Real user balance
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch coin data for ${address}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        allCreators.push(...batchResults.filter(creator => creator !== null) as Creator[]);
      }

      setCreators(allCreators);
    } catch (error) {
      console.error('Failed to fetch creator data:', error);
      // Fallback to empty array on error
      setCreators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [zoraCoins]); // Re-fetch when user's coin balances change

  const CreatorCard = ({ creator }: { creator: Creator }) => (
    <div 
      onClick={() => router.push(`/creator/${creator.id}`)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          <Image
            src={creator.imageUrl || ''}
            alt={creator.name}
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-black">{creator.name}</h3>
            <p className="text-gray-500 text-sm">${creator.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="font-semibold text-black">
              ${creator.marketCap ? parseFloat(creator.marketCap).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <Users className="w-3 h-3" /> Holders
            </p>
            <p className="font-semibold text-sm">{creator.holders?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> 24h Vol
            </p>
            <p className="font-semibold text-sm">
              ${creator.volume24h ? Math.floor(parseFloat(creator.volume24h)).toLocaleString() : '0'}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <Coins className="w-3 h-3" /> Content
            </p>
            <p className="font-semibold text-sm">{creator.contentCount}</p>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      {/* Main Content - Header is 64px (h-16) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Info Banner */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Explore Creators
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hold creator coins to access exclusive content, early releases, behind the scenes material, 
            and special perks from your favorite creators.
          </p>
        </div>

        {/* Creator Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={`loading-${i}`} className="bg-white rounded-2xl border border-gray-200 h-96 animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}