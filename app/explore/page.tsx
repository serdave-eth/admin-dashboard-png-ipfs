'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Unlock, Users, TrendingUp, Coins } from 'lucide-react';
import { getCoinsMostValuable, getCoinsTopGainers } from '@zoralabs/coins-sdk';
import { usePrivy } from '@privy-io/react-auth';
import LoginButton from '@/components/Auth/LoginButton';

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
  const { authenticated } = usePrivy();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'valuable' | 'gainers' | 'active'>('valuable');

  // Mock content data for creators - 3 creators only
  const mockCreators: Creator[] = [
    {
      id: 'higher',
      name: 'higher',
      symbol: 'HIGHER',
      address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
      marketCap: '15000000',
      holders: 12500,
      volume24h: '2500000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=higher&backgroundColor=b6e3f4',
      contentCount: 156,
      isLocked: true,
    },
    {
      id: 'imagine',
      name: 'Imagine',
      symbol: 'IMAGINE',
      address: '0x078540eecc8b6d89949c9c7d5e8e91eab64f6696',
      marketCap: '8000000',
      holders: 8200,
      volume24h: '1200000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=imagine&backgroundColor=c0aede',
      contentCount: 89,
      isLocked: false,
    },
    {
      id: 'enjoy',
      name: 'ENJOY',
      symbol: 'ENJOY',
      address: '0xa6B280B42CB0b7c4a4F789eC6cCC3a7609A1Bc39',
      marketCap: '5000000',
      holders: 6500,
      volume24h: '800000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=enjoy&backgroundColor=ffd5dc',
      contentCount: 234,
      isLocked: true,
    },
  ];

  useEffect(() => {
    // For now, use mock data
    setCreators(mockCreators);
    setLoading(false);
  }, [activeTab]);

  const CreatorCard = ({ creator }: { creator: Creator }) => (
    <div 
      onClick={() => router.push(`/creator/${creator.id}`)}
      className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
        <img
          src={creator.imageUrl}
          alt={creator.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
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
              ${parseFloat(creator.marketCap || '0').toLocaleString()}
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
              ${parseFloat(creator.volume24h || '0').toLocaleString()}
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
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
                className="text-black font-medium hover:text-gray-600 transition-colors"
              >
                Explore
              </button>
              <button
                onClick={() => router.push('/create')}
                className="text-black font-medium hover:text-gray-600 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => router.push('/portfolio')}
                className="text-black font-medium hover:text-gray-600 transition-colors"
              >
                Portfolio
              </button>
            </div>
            
            {/* Dashboard and Connect Wallet Buttons */}
            <div className="flex items-center space-x-4">
              {authenticated && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                >
                  Dashboard
                </button>
              )}
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Explore Creators
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hold creator coins to access exclusive content, early releases, behind-the-scenes material, 
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