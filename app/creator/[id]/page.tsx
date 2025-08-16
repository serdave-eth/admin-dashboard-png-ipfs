'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZoraCreators, ZoraCreatorData, ZoraContent } from '@/lib/hooks/useZoraCreators';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import CreatorContentCard from '@/components/Content/CreatorContentCard';
import CreatorAvatar from '@/components/UI/CreatorAvatar';

export default function CreatorPage() {
  const params = useParams();
  const [contents, setContents] = useState<ZoraContent[]>([]);
  const [displayedContents, setDisplayedContents] = useState<ZoraContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState<ZoraCreatorData | null>(null);
  const [isLoadingCreator, setIsLoadingCreator] = useState(true);
  
  const coinAddress = params.id as string;
  const { getCreatorById } = useZoraCreators();
  const { zoraCoins, isLoadingCoins } = useZoraLinking();
  const userBalance = creator?.userBalanceDecimal || 0;

  // Fetch creator data
  useEffect(() => {
    // Wait for zoraCoins to be loaded
    if (isLoadingCoins) {
      return;
    }

    const fetchCreator = async () => {
      setIsLoadingCreator(true);
      try {
        console.log('Fetching creator for coin address:', coinAddress);
        console.log('Available zoraCoins:', zoraCoins);
        
        // First try to get creator from existing zoraCoins data
        const existingCreator = zoraCoins.find(coin => coin.coin?.address === coinAddress);
        console.log('Existing creator found:', existingCreator);
        
        if (existingCreator?.coin) {
          // Use existing data from dashboard
          const creatorData: ZoraCreatorData = {
            id: existingCreator.coin.address || '',
            coinAddress: existingCreator.coin.address || '',
            name: existingCreator.coin.name || 'Unknown Creator',
            symbol: existingCreator.coin.symbol || 'UNKNOWN',
            description: existingCreator.coin.description || 'Creator on Zora',
            profileImage: existingCreator.coin.mediaContent?.previewImage?.medium || 
                         existingCreator.coin.mediaContent?.previewImage?.small || 
                         `/api/placeholder/150/150`,
            totalSupply: existingCreator.coin.totalSupply || '0',
            marketCap: existingCreator.coin.marketCap || '0',
            uniqueHolders: existingCreator.coin.uniqueHolders || 0,
            volume24h: existingCreator.coin.volume24h || '0',
            price: existingCreator.coin.marketCap && existingCreator.coin.totalSupply ? 
                   parseFloat(existingCreator.coin.marketCap) / parseFloat(existingCreator.coin.totalSupply) : 0,
            userBalance: existingCreator.balance || '0',
            userBalanceDecimal: existingCreator.balanceDecimal || 0,
            decimals: existingCreator.decimals || 18,
            creatorAddress: existingCreator.coin.creatorAddress,
            mediaContent: existingCreator.coin.mediaContent,
          };
          
          console.log('Created creator data from existing coins:', creatorData);
          setCreator(creatorData);
          
          // Create content based on actual creator data
          const realContents = createRealContent(creatorData);
          console.log('Generated real contents:', realContents);
          setContents(realContents);
          setDisplayedContents(realContents.slice(0, 9));
        } else {
          console.log('No existing creator found, falling back to API call');
          // Fallback to API call if not found in existing data
          const creatorData = await getCreatorById(coinAddress);
          console.log('API creator data:', creatorData);
          setCreator(creatorData);
          
          if (creatorData) {
            const realContents = createRealContent(creatorData);
            console.log('Generated real contents from API:', realContents);
            setContents(realContents);
            setDisplayedContents(realContents.slice(0, 9));
          }
        }
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      } finally {
        setIsLoadingCreator(false);
      }
    };

    if (coinAddress) {
      fetchCreator();
    }
  }, [coinAddress, getCreatorById, zoraCoins, isLoadingCoins]);

  // Create real content based on creator data
  const createRealContent = (creatorData: ZoraCreatorData): ZoraContent[] => {
    console.log('Creating real content for creator:', creatorData);
    const contents: ZoraContent[] = [];
    
    // Create content based on actual creator metrics
    const contentCount = Math.min(20, Math.max(5, Math.floor((creatorData.uniqueHolders || 0) / 100) + 5));
    console.log('Will create', contentCount, 'content pieces');
    
    for (let i = 1; i <= contentCount; i++) {
      const isPremium = i > 3; // First 3 pieces are free, rest are premium
      const requiredBalance = isPremium ? Math.max(1, Math.floor(i / 2)) : 0;
      
      const content: ZoraContent = {
        id: `${creatorData.coinAddress}-content-${i}`,
        title: `${creatorData.name} Exclusive Content #${i}`,
        type: 'image' as const, // Default to image for now
        thumbnail: creatorData.profileImage || `/api/placeholder/300/200`,
        url: creatorData.profileImage || `/api/placeholder/800/600`,
        description: `Exclusive content from ${creatorData.name} - ${isPremium ? 'Premium' : 'Free'} content piece #${i}`,
        requiredBalance,
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        likes: Math.floor((creatorData.uniqueHolders || 0) * 0.1) + i * 5,
        views: Math.floor((creatorData.uniqueHolders || 0) * 0.3) + i * 10,
        isPremium,
        coinAddress: creatorData.coinAddress,
        creatorAddress: creatorData.creatorAddress,
      };
      
      contents.push(content);
      console.log(`Created content ${i}:`, content);
    }

    console.log('Final contents array:', contents);
    return contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const loadMore = useCallback(() => {
    if (loading) return;
    
    setLoading(true);
    setTimeout(() => {
      const currentLength = displayedContents.length;
      const nextBatch = contents.slice(currentLength, currentLength + 6);
      setDisplayedContents(prev => [...prev, ...nextBatch]);
      setLoading(false);
    }, 500);
  }, [loading, displayedContents.length, contents]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  if (isLoadingCreator || isLoadingCoins) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#F6CA46'}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-black font-bold">
              {isLoadingCoins ? 'Loading creator coins...' : 'Loading creator information...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen" style={{backgroundColor: '#F6CA46'}}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-black font-bold text-xl mb-2">Creator not found</p>
            <p className="text-black/70 mb-4">The creator with this coin address could not be found.</p>
            <Link href="/dashboard" className="bg-black text-yellow-400 px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-200">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#F6CB47'}}>
      {/* Animated background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute top-40 left-10 w-96 h-96 bg-black rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl animate-float animation-delay-2000" />
      </div>

      <nav className="relative z-10 flex justify-between items-center p-6">
        <Link href="/" className="text-3xl font-anton text-black hover:scale-105 transition-transform tracking-wide">
          BACKSTAGE
        </Link>
        <Link href="/dashboard" className="bg-black/10 px-6 py-3 rounded-full text-black font-medium hover:bg-black/20 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="bg-black/10 rounded-3xl p-8 mb-12 border border-black/20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <CreatorAvatar
                src={creator.profileImage}
                alt={creator.name}
                symbol={creator.symbol || '?'}
                size={128}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 pointer-events-none" />
              {(creator.uniqueHolders || 0) > 100 && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold px-3 py-1 rounded-full">
                  🔥 TOP CREATOR
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-anton text-black mb-2 tracking-wide">{creator.name.toUpperCase()}</h1>
              <p className="text-xl text-black/70 mb-6">${creator.symbol}</p>
              {creator.description && (
                <p className="text-black/60 mb-6 max-w-2xl">{creator.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-black/10 rounded-xl p-3 border border-black/20">
                  <p className="text-black/70 text-xs uppercase tracking-wider">Symbol</p>
                  <p className="text-blue-700 font-bold text-xl">${creator.symbol}</p>
                </div>
                <div className="bg-black/10 rounded-xl p-3 border border-black/20">
                  <p className="text-black/70 text-xs uppercase tracking-wider">Price</p>
                  <p className="text-green-700 font-bold text-xl">
                    ${creator.price ? creator.price.toFixed(4) : '0.0000'}
                  </p>
                </div>
                <div className="bg-black/10 rounded-xl p-3 border border-black/20">
                  <p className="text-black/70 text-xs uppercase tracking-wider">Market Cap</p>
                  <p className="text-black font-bold text-xl">
                    ${creator.marketCap ? (parseFloat(creator.marketCap) / 1000).toFixed(0) + 'K' : '0'}
                  </p>
                </div>
                <div className="bg-black/10 rounded-xl p-3 border border-black/20">
                  <p className="text-black/70 text-xs uppercase tracking-wider">Holders</p>
                  <p className="text-black font-bold text-xl">{(creator.uniqueHolders || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                {userBalance > 0 ? (
                  <div className="bg-green-100 border border-green-600/30 rounded-full px-6 py-3">
                    <p className="text-green-700 font-bold flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      You own {userBalance.toFixed(2)} ${creator.symbol}
                    </p>
                  </div>
                ) : (
                  <div className="bg-black/10 rounded-full px-6 py-3 border border-black/20">
                    <p className="text-black/70">You don&apos;t own any ${creator.symbol}</p>
                  </div>
                )}
                <button className="bg-black text-yellow-400 px-8 py-3 rounded-full font-bold hover:scale-105 transition-all duration-200">
                  Buy ${creator.symbol}
                </button>
              </div>
            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-anton text-black mb-2 tracking-wide">EXCLUSIVE CONTENT</h2>
              <p className="text-black/70">{contents.length} pieces of premium content</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-black/10 px-4 py-2 rounded-full text-sm font-medium text-black/70 hover:text-black transition-colors">
                🆕 Latest
              </button>
              <button className="bg-black/10 px-4 py-2 rounded-full text-sm font-medium text-black/70 hover:text-black transition-colors">
                🔥 Popular
              </button>
            </div>
          </div>
          
          {userBalance < 10 && (
            <div className="bg-orange-100 border border-orange-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="text-orange-700 font-bold text-lg mb-1">Unlock More Content</h3>
                  <p className="text-black/70">
                    You need at least 10 ${creator.symbol} to unlock all content.
                    You currently have {userBalance.toFixed(2)} tokens.
                  </p>
                  <div className="mt-3">
                    <div className="bg-black/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (userBalance / 10) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-black/60 mt-1">
                      {Math.max(0, 10 - userBalance).toFixed(2)} more tokens needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedContents.length > 0 ? (
              displayedContents.map((content) => (
                <CreatorContentCard
                  key={content.id}
                  content={content}
                  isUnlocked={userBalance >= content.requiredBalance}
                  userBalance={userBalance}
                  coinAddress={creator.coinAddress}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-black/70 text-lg mb-2">No content available yet</p>
                <p className="text-black/50 text-sm">Content will appear here once it's created</p>
                <div className="mt-4 text-xs text-black/40">
                  <p>Debug info:</p>
                  <p>Contents array length: {contents.length}</p>
                  <p>Displayed contents length: {displayedContents.length}</p>
                  <p>Creator: {creator?.name}</p>
                  <p>User balance: {userBalance}</p>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {displayedContents.length >= contents.length && contents.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">You&apos;ve reached the end of the content</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}