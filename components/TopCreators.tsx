'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getCoin } from '@zoralabs/coins-sdk';

interface Creator {
  id: string;
  name: string;
  address: string;
  imageUrl: string;
}

export default function TopCreators() {
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Specific Zora coin addresses to fetch
  const targetAddresses = [
    '0x024d3b7fb4917d030d097d76925a6c0531cd0623', // Serdave-eth
    '0x7a0cc651e7b92b273b51c0dbc7db6056822f073b', // maariab
    '0x0f04832da0070c834112209f7f4d56417869172d', // franklen
  ];

  // Fetch real creator data from Zora API
  useEffect(() => {
    const fetchCreators = async () => {
      try {
        const creatorPromises = targetAddresses.map(async (address) => {
          try {
            const response = await getCoin({ address });
            const coin = response.data?.zora20Token;
            
            if (coin) {
              return {
                id: coin.address,
                name: coin.name || 'Unknown Creator',
                address: coin.address,
                imageUrl: coin.mediaContent?.previewImage?.medium || 
                         coin.mediaContent?.previewImage?.small || 
                         `https://api.dicebear.com/7.x/identicon/svg?seed=${coin.name}&backgroundColor=b6e3f4`,
              };
            }
            return null;
          } catch (error) {
            console.error(`Failed to fetch coin data for ${address}:`, error);
            return null;
          }
        });

        const results = await Promise.all(creatorPromises);
        const validCreators = results.filter((creator): creator is Creator => creator !== null);
        setCreators(validCreators);
      } catch (error) {
        console.error('Failed to fetch creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="group">
            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse border-4 border-white shadow-lg"></div>
            <div className="h-4 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center space-x-6">
      {creators.map((creator) => (
        <div
          key={creator.id}
          onClick={() => router.push(`/creator/${creator.id}`)}
          className="group cursor-pointer transition-transform hover:scale-110"
        >
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
            <Image
              src={creator.imageUrl}
              alt={creator.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <p className="text-center text-sm font-medium text-gray-600 mt-2 group-hover:text-black transition-colors">
            {creator.name}
          </p>
        </div>
      ))}
    </div>
  );
}