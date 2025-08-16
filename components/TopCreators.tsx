'use client';

import { useEffect, useState } from 'react';
import { getCoinsMostValuable } from '@zoralabs/coins-sdk';

interface Coin {
  id: string;
  name: string;
  symbol: string;
  address: string;
  marketCap?: string;
  volume24h?: string;
  createdAt?: string;
  avatarUrl?: string;
  imageUrl?: string;
  profileImageUrl?: string;
  image?: string;
  avatar?: string;
  profileImage?: string;
  metadata?: any;
  [key: string]: any; // Allow for any additional fields
}

export default function TopCreators() {
  const [creators, setCreators] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fallback data with 6 creators
  const fallbackCoins: Coin[] = [
    {
      id: 'higher',
      name: 'higher',
      symbol: 'HIGHER',
      address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
      marketCap: '15000000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=higher&backgroundColor=b6e3f4`,
    },
    {
      id: 'imagine',
      name: 'Imagine',
      symbol: 'IMAGINE',
      address: '0x078540eecc8b6d89949c9c7d5e8e91eab64f6696',
      marketCap: '8000000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=imagine&backgroundColor=c0aede`,
    },
    {
      id: 'enjoy',
      name: 'ENJOY',
      symbol: 'ENJOY',
      address: '0xa6B280B42CB0b7c4a4F789eC6cCC3a7609A1Bc39',
      marketCap: '5000000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=enjoy&backgroundColor=ffd5dc`,
    },
    {
      id: 'degen',
      name: 'Degen',
      symbol: 'DEGEN',
      address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
      marketCap: '12000000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=degen&backgroundColor=a7f3d0`,
    },
    {
      id: 'build',
      name: 'Build',
      symbol: 'BUILD',
      address: '0x3C1f29E67f5a8b6e5e9f9b9e5e5e5e5e5e5e5e5e',
      marketCap: '9500000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=build&backgroundColor=fbbf24`,
    },
    {
      id: 'create',
      name: 'Create',
      symbol: 'CREATE',
      address: '0x2B1e28E67f5a8b6e5e9f9b9e5e5e5e5e5e5e5e5e',
      marketCap: '7200000',
      imageUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=create&backgroundColor=f472b6`,
    },
  ];

  useEffect(() => {
    const fetchMostValuableCoins = async () => {
      try {
        const response = await getCoinsMostValuable({
          count: 5,
        });

        console.log('Full Zora API Response:', response);
        
        const coins = response.data?.exploreList?.edges?.map((edge: any) => {
          console.log('Edge node:', edge.node);
          // Look for any image-related fields
          const node = edge.node;
          console.log('Available fields:', Object.keys(node));
          return node;
        }) || [];
        
        console.log('Extracted coins with details:', coins);
        
        // Use fallback data if API returns empty or fails
        if (coins.length > 0) {
          setCreators(coins);
        } else {
          console.log('Using fallback coin data');
          setCreators(fallbackCoins);
        }
      } catch (error) {
        console.error('Error fetching most valuable coins:', error);
        // Use fallback data on error
        setCreators(fallbackCoins);
      } finally {
        setLoading(false);
      }
    };

    fetchMostValuableCoins();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center space-x-8 px-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={`loading-${index}`}
            className="w-24 h-24 rounded-full bg-gray-200 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-8">
      {creators.slice(0, 5).map((creator, index) => (
        <div
          key={creator.id || `creator-${index}`}
          className="flex-shrink-0"
        >
          <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden border-2 border-gray-200 shadow-lg flex-shrink-0">
            {creator.imageUrl ? (
              <img
                src={creator.imageUrl}
                alt={creator.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white text-2xl font-bold';
                    fallback.textContent = creator.name?.charAt(0) || creator.symbol?.charAt(0) || '?';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600 text-white text-2xl font-bold">
                {creator.name?.charAt(0) || creator.symbol?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {creators.length === 0 && (
        <div className="text-gray-500">No top gainers available</div>
      )}
    </div>
  );
}