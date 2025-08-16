'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZoraCreators, ZoraCreatorData } from '@/lib/hooks/useZoraCreators';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { ContentItem } from '@/types';
import CreatorAvatar from '@/components/UI/CreatorAvatar';
import Image from 'next/image';
import { Heart, Eye, Lock, Download } from 'lucide-react';

export default function CreatorPage() {
  const params = useParams();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [displayedContents, setDisplayedContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [creator, setCreator] = useState<ZoraCreatorData | null>(null);
  const [isLoadingCreator, setIsLoadingCreator] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
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
          
          // Real content will be fetched separately via API
        } else {
          console.log('No existing creator found, falling back to API call');
          // Fallback to API call if not found in existing data
          const creatorData = await getCreatorById(coinAddress);
          console.log('API creator data:', creatorData);
          setCreator(creatorData);
          
          // Real content will be fetched separately via API
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

  // Fetch real content from database
  const fetchContent = useCallback(async (cursor?: string) => {
    if (!coinAddress) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '20'
      });
      
      if (cursor) {
        params.append('cursor', cursor);
      }
      
      const response = await fetch(`/api/content/creator/${coinAddress}?${params}`);
      const data = await response.json();
      
      if (data.success !== false) {
        const newContents = data.items || [];
        
        if (cursor) {
          // Append to existing content
          setContents(prev => [...prev, ...newContents]);
          setDisplayedContents(prev => [...prev, ...newContents]);
        } else {
          // Replace content
          setContents(newContents);
          setDisplayedContents(newContents);
        }
        
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
      setIsLoadingContent(false);
    }
  }, [coinAddress]);

  // Fetch content when component mounts
  useEffect(() => {
    if (coinAddress) {
      fetchContent();
    }
  }, [coinAddress, fetchContent]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !nextCursor) return;
    fetchContent(nextCursor);
  }, [loading, hasMore, nextCursor, fetchContent]);

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
              <h2 className="text-4xl font-anton text-black mb-2 tracking-wide">CREATOR CONTENT</h2>
              <p className="text-black/70">
                {isLoadingContent ? 'Loading content...' : 
                 contents.length === 0 ? 'No content available' : 
                 `${contents.length} content ${contents.length === 1 ? 'item' : 'items'}`}
              </p>
            </div>
          </div>
          
          {contents.length > 0 && (
            <div className="bg-blue-100 border border-blue-500/30 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-3xl">📁</span>
                <div>
                  <h3 className="text-blue-700 font-bold text-lg mb-1">Content Access</h3>
                  <p className="text-black/70">
                    Content access is determined by your ${creator.symbol} token balance and the minimum requirements set by the creator.
                    You currently have {userBalance.toFixed(2)} tokens.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLoadingContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-black/10 rounded-2xl overflow-hidden border border-black/20 animate-pulse">
                  <div className="aspect-video bg-black/20" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-black/20 rounded w-3/4" />
                    <div className="h-3 bg-black/20 rounded w-full" />
                    <div className="h-3 bg-black/20 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedContents.length > 0 ? (
                displayedContents.map((content) => {
                  const requiredBalance = content.minimumTokenAmount ? parseFloat(content.minimumTokenAmount) : 0;
                  const isUnlocked = userBalance >= requiredBalance;
                  
                  return (
                    <div key={content.id} className="group bg-black/10 rounded-2xl overflow-hidden border border-black/20 hover:border-black/30 transition-all duration-300 hover:scale-105">
                      {/* Content Preview */}
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={`https://gateway.pinata.cloud/ipfs/${content.ipfsCid}`}
                          alt={content.filename}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/300/200';
                          }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Content Type Icon */}
                        <div className="absolute top-3 left-3 bg-green-500 rounded-full p-2">
                          <Download className="w-4 h-4 text-white" />
                        </div>

                        {/* Premium Badge */}
                        {requiredBalance > 0 && (
                          <div className="absolute top-3 right-3 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-bold">
                            PREMIUM
                          </div>
                        )}

                        {/* Lock Overlay for locked content */}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                              <Lock className="w-8 h-8 text-white mb-2 mx-auto" />
                              <p className="text-white text-sm font-bold">
                                {requiredBalance} tokens required
                              </p>
                              <p className="text-white/70 text-xs">
                                You have {userBalance.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* File Size in bottom corner */}
                        <div className="absolute bottom-3 left-3 text-white text-xs bg-black/50 px-2 py-1 rounded">
                          {(parseInt(content.fileSize) / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <h3 className="font-anton text-lg text-black mb-2 tracking-wide truncate">
                          {content.filename.toUpperCase()}
                        </h3>
                        <p className="text-black/70 text-sm mb-3">
                          {content.fileType.toUpperCase()} • {new Date(content.createdAt).toLocaleDateString()}
                        </p>

                        {/* Access Requirements */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {isUnlocked ? (
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            ) : (
                              <Lock className="w-3 h-3 text-black/50" />
                            )}
                            <span className="text-xs text-black/70">
                              {isUnlocked ? 'Unlocked' : `${requiredBalance} tokens needed`}
                            </span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <button 
                          className={`w-full py-2 px-4 rounded-full font-bold text-sm transition-all duration-200 ${
                            isUnlocked 
                              ? 'bg-black text-yellow-400 hover:scale-105' 
                              : 'bg-black/20 text-black/50 cursor-not-allowed'
                          }`}
                          disabled={!isUnlocked}
                          onClick={() => {
                            if (isUnlocked) {
                              window.open(`https://gateway.pinata.cloud/ipfs/${content.ipfsCid}`, '_blank');
                            }
                          }}
                        >
                          {isUnlocked ? 'View Content' : 'Locked'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-black/70 text-lg mb-2">No content available</p>
                  <p className="text-black/50 text-sm">This creator hasn't uploaded any content yet</p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          )}

          {!loading && hasMore && contents.length > 0 && (
            <div className="text-center py-8">
              <button 
                onClick={loadMore}
                className="bg-black text-yellow-400 px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-200"
              >
                Load More Content
              </button>
            </div>
          )}
          
          {!hasMore && contents.length > 0 && (
            <div className="text-center py-8">
              <p className="text-black/50">You've reached the end of the content</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}