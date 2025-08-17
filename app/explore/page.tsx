'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Unlock, Users, TrendingUp, Coins } from 'lucide-react';
import Image from 'next/image';
import { getCoin } from '@zoralabs/coins-sdk';

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
  isLocked?: boolean;
}

export default function ExplorePage() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  // Specific Zora coin addresses to fetch
  const targetAddresses = [
    '0x024d3b7fb4917d030d097d76925a6c0531cd0623', // Serdave-eth
    '0x7a0cc651e7b92b273b51c0dbc7db6056822f073b', // maariab
    '0x0f04832da0070c834112209f7f4d56417869172d', // franklen
  ];

  // Fetch content count for a creator
  const fetchContentCount = async (coinAddress: string): Promise<number> => {
    try {
      const response = await fetch(`/api/content/creator/${coinAddress}?limit=1000`);
      const data = await response.json();
      return data.items?.length || 0;
    } catch (error) {
      console.error(`Failed to fetch content count for ${coinAddress}:`, error);
      return 0;
    }
  };

  // Fetch real creator data from Zora API
  const fetchCreatorData = async () => {
    setLoading(true);
    try {
      const creatorPromises = targetAddresses.map(async (address) => {
        try {
          const response = await getCoin({ address });
          const coin = response.data?.zora20Token;
          
          if (coin) {
            // Fetch actual content count
            const contentCount = await fetchContentCount(coin.address);
            
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
              isLocked: Math.random() > 0.5, // Random lock status
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to fetch coin data for ${address}:`, error);
          return null;
        }
      });

      const results = await Promise.all(creatorPromises);
      const validCreators = results.filter(creator => creator !== null) as Creator[];
      setCreators(validCreators);
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
  }, []);

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
        <div className="absolute top-4 right-4 p-2 rounded-full">
          {creator.isLocked ? (
            <div className="bg-black/80 text-white p-2 rounded-full">
              <Lock className="w-4 h-4" />
            </div>
          ) : (
            <div className="bg-green-500 text-white p-2 rounded-full">
              <Unlock className="w-4 h-4" />
            </div>
          )}
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
              ${creator.volume24h ? parseFloat(creator.volume24h).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}
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