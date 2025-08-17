'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useZoraCreators, ZoraCreatorData } from '@/lib/hooks/useZoraCreators';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { ContentItem } from '@/types';
import CreatorAvatar from '@/components/UI/CreatorAvatar';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { createCreatorService } from '@/lib/services/creatorService';
import { createContentService } from '@/lib/services/contentService';
import { createBalanceUtils } from '@/lib/utils/balanceUtils';
import ContentModal from '@/components/Content/ContentModal';

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
  const [hasFetchedCreator, setHasFetchedCreator] = useState(false);
  
  // Content modal state
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const coinAddress = params.id as string;
  const { getCreatorById } = useZoraCreators();
  const { zoraCoins, zoraWallet, fetchZoraCoins } = useZoraLinking();
  const { login, ready, user } = usePrivy();
  const userBalance = creator?.userBalanceDecimal || 0;
  
  // Debug useZoraLinking hook values
  console.log('=== CREATOR PAGE RENDER ===');
  console.log('zoraWallet:', zoraWallet);
  console.log('zoraCoins length:', zoraCoins.length);
  console.log('fetchZoraCoins function:', typeof fetchZoraCoins);
  
  // Initialize services
  const creatorService = createCreatorService(getCreatorById);
  const contentService = createContentService();
  const balanceUtils = createBalanceUtils();
  
  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  // Get user's wallet address if available
  const userWalletAddress = balanceUtils.getUserWalletAddress(user);

  // Function to check balance using the balance utils
  const getUserBalanceForCoin = useCallback((coinAddress: string) => {
    return balanceUtils.getUserBalanceForCoin(coinAddress, zoraCoins);
  }, [zoraCoins, balanceUtils]);
  
  // Debug user balance calculation
  useEffect(() => {
    if (creator) {
      console.log('=== DEBUGGING BALANCE CALCULATION ===');
      console.log('Current creator state:', creator);
      console.log('User balance from creator:', userBalance);
      console.log('Zora wallet smart wallet:', zoraWallet?.smartWallet);
      console.log('Zora coins available:', zoraCoins.length);
      
      if (zoraCoins.length > 0) {
        console.log('First few Zora coins:', zoraCoins.slice(0, 3));
        console.log('Looking for coin with address:', coinAddress);
        
        const matchingCoin = zoraCoins.find(coin => 
          coin.coin?.address?.toLowerCase() === coinAddress.toLowerCase()
        );
        console.log('Matching coin found:', matchingCoin);
        
        if (matchingCoin) {
          console.log('Matching coin details:', {
            address: matchingCoin.coin?.address,
            name: matchingCoin.coin?.name,
            symbol: matchingCoin.coin?.symbol,
            balance: matchingCoin.balance,
            balanceDecimal: matchingCoin.balanceDecimal,
            decimals: matchingCoin.decimals,
            isOwner: matchingCoin.isOwner
          });
        }
      }
      
      balanceUtils.debugBalanceCalculation(creator, userBalance);
    }
  }, [creator, userBalance, balanceUtils, zoraCoins, coinAddress, zoraWallet?.smartWallet]);

  // Fetch creator data using creator service
  useEffect(() => {
    const fetchCreator = async () => {
      if (hasFetchedCreator) return;
      
      setIsLoadingCreator(true);
      try {
        console.log('User wallet address:', userWalletAddress);
        
        const creatorData = await creatorService.fetchCreatorById(coinAddress);
        
        if (creatorData) {
          setCreator(creatorData);
          setHasFetchedCreator(true);
        }
      } catch (error) {
        console.error('Failed to fetch creator:', error);
      } finally {
        setIsLoadingCreator(false);
      }
    };

    if (coinAddress && !hasFetchedCreator) {
      fetchCreator();
    }
  }, [coinAddress, creatorService, hasFetchedCreator, userWalletAddress]);

  // Fetch Zora coins when component mounts and Zora wallet is available
  useEffect(() => {
    console.log('=== CHECKING IF SHOULD FETCH ZORA COINS ===');
    console.log('Zora wallet exists:', !!zoraWallet);
    console.log('Zora wallet smart wallet:', zoraWallet?.smartWallet);
    console.log('Zora coins already loaded:', zoraCoins.length);
    
    if (zoraWallet?.smartWallet && zoraCoins.length === 0) {
      console.log('=== FETCHING ZORA COINS ===');
      fetchZoraCoins();
    } else {
      console.log('=== NOT FETCHING ZORA COINS ===');
      console.log('Reason: No smart wallet or coins already loaded');
    }
  }, [zoraWallet, zoraCoins.length, fetchZoraCoins]);

  // Update user balance when zoraCoins are available
  useEffect(() => {
    console.log('=== BALANCE UPDATE EFFECT TRIGGERED ===');
    console.log('Effect dependencies:', {
      creator: !!creator,
      coinAddress,
      zoraCoinsLength: zoraCoins.length,
      zoraWalletSmartWallet: zoraWallet?.smartWallet
    });
    
    if (creator && coinAddress && zoraCoins.length > 0) {
      console.log('=== UPDATING USER BALANCE FROM ZORA COINS ===');
      console.log('Creator coin address:', coinAddress);
      console.log('Zora coins available:', zoraCoins.length);
      console.log('Zora coins data:', zoraCoins);
      
      const balanceData = getUserBalanceForCoin(coinAddress);
      console.log('Balance data returned from getUserBalanceForCoin:', balanceData);
      
      const updatedCreator = creatorService.updateCreatorBalance(creator, balanceData);
      console.log('Updated creator with balance:', updatedCreator);
      console.log('User balance decimal:', updatedCreator.userBalanceDecimal);
      
      setCreator(updatedCreator);
    } else {
      console.log('=== BALANCE UPDATE CONDITIONS NOT MET ===');
      console.log('Creator exists:', !!creator);
      console.log('Coin address:', coinAddress);
      console.log('Zora coins length:', zoraCoins.length);
      console.log('Zora wallet smart wallet:', zoraWallet?.smartWallet);
      
      if (!creator) console.log('❌ Missing: creator');
      if (!coinAddress) console.log('❌ Missing: coinAddress');
      if (zoraCoins.length === 0) console.log('❌ Missing: zoraCoins (length is 0)');
      if (!zoraWallet?.smartWallet) console.log('❌ Missing: zoraWallet.smartWallet');
    }
  }, [creator, coinAddress, zoraCoins, getUserBalanceForCoin, creatorService, zoraWallet?.smartWallet]);

  // Fetch content using content service
  const fetchContent = useCallback(async (cursor?: string) => {
    if (!coinAddress) return;
    
    try {
      setLoading(true);
      
      const response = await contentService.fetchCreatorContent({
        coinAddress,
        cursor
      });
      
      const newContents = response.items;
      
      if (cursor) {
        // Append to existing content
        setContents(prev => [...prev, ...newContents]);
        setDisplayedContents(prev => [...prev, ...newContents]);
      } else {
        // Replace content
        setContents(newContents);
        setDisplayedContents(newContents);
      }
      
      setNextCursor(response.nextCursor || null);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
      setIsLoadingContent(false);
    }
  }, [coinAddress, contentService]);

  // Fetch content when component mounts - only depend on coinAddress
  useEffect(() => {
    if (coinAddress) {
      fetchContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinAddress]); // Intentionally omit fetchContent to prevent circular calls

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

  if (!ready || isLoadingCreator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
            <p className="text-black font-bold">
              {!ready ? 'Initializing...' : 'Loading creator information...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-black font-bold text-xl mb-2">Creator not found</p>
            <p className="text-black/70 mb-4">The creator with this coin address could not be found.</p>
            <Link href="/dashboard" className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
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
                  TOP CREATOR
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl font-anton text-black mb-2 tracking-wide">{creator.name.toUpperCase()}</h1>
              <p className="text-xl text-black/70 mb-6">${creator.symbol}</p>
              
              <div className="grid grid-cols-2 gap-3 mb-4 max-w-xs">
                <div>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    Market Cap
                  </p>
                  <p className="font-semibold text-lg">
                    {creator.marketCap ? (() => {
                      const mcap = parseFloat(creator.marketCap);
                      if (mcap >= 1000000) return `$${(mcap / 1000000).toFixed(1)}M`;
                      if (mcap >= 1000) return `$${(mcap / 1000).toFixed(0)}K`;
                      return `$${mcap.toFixed(0)}`;
                    })() : '$0'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    Holders
                  </p>
                  <p className="font-semibold text-lg">{(creator.uniqueHolders || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                {zoraWallet?.smartWallet && (
                  userBalance > 0 ? (
                    <div className="bg-green-100 border border-green-600/30 rounded-full px-6 py-3">
                      <p className="text-green-700 font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                        You own {balanceUtils.formatBalance(userBalance)} ${creator.symbol}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-full px-6 py-3 border border-gray-200">
                      <p className="text-gray-600">You don&apos;t own any ${creator.symbol}</p>
                    </div>
                  )
                )}
                <button className="bg-black text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  Buy ${creator.symbol}
                </button>
              </div>
              

            </div>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-anton text-black mb-2 tracking-wide">CONTENT</h2>
            </div>
          </div>
          

          {isLoadingContent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedContents.length > 0 ? (
                displayedContents.map((content) => {
                  const requiredBalance = contentService.getRequiredBalance(content);
                  const isUnlocked = contentService.checkContentAccess(content, userBalance);
                  
                  return (
                    <div key={content.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300">
                      {/* Content Preview */}
                      <div className="relative aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={contentService.buildContentImageUrl(content.ipfsCid)}
                          alt={content.filename}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            !isUnlocked ? 'blur-xl' : ''
                          }`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.style.display = 'none';
                          }}
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        

                        {/* Premium Badge */}
                        {requiredBalance > 0 && (
                          <div className="absolute top-3 right-3 bg-black text-white px-2 py-1 rounded-full text-xs font-bold">
                            PREMIUM
                          </div>
                        )}

                        {/* Lock Overlay for locked content */}
                        {!isUnlocked && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center bg-black/80 rounded-xl p-4">
                              <Lock className="w-10 h-10 text-yellow-400 mb-2 mx-auto" />
                              <p className="text-white text-sm font-bold">
                                {requiredBalance} tokens required
                              </p>
                              <p className="text-white/70 text-xs mt-1">
                                You have {balanceUtils.formatBalance(userBalance)}

                              </p>
                              {!user && (
                                <p className="text-white/80 text-xs mt-1">
                                  Log in to check balance
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <h3 className="font-anton text-lg text-black mb-2 tracking-wide truncate">
                          {content.filename.replace(/\.[^/.]+$/, "").toUpperCase()}
                        </h3>
                        <p className="text-black/70 text-sm mb-3">
                          {content.fileType.toLowerCase().startsWith('image/') ? 'IMAGE' : content.fileType.toUpperCase()} • {formatRelativeTime(new Date(content.createdAt))}
                        </p>


                        {/* Action Button */}
                        <button 
                          className="w-full py-2 px-4 rounded-full font-semibold text-sm transition-colors cursor-pointer bg-black text-white hover:bg-gray-800"
                          onClick={() => {
                            if (isUnlocked) {
                              setSelectedContent(content);
                              setIsModalOpen(true);
                            }
                          }}
                        >
                          {isUnlocked ? 'View Content' : `Buy ${requiredBalance} $${creator.symbol}`}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-600 text-lg mb-2">No content available</p>
                  <p className="text-gray-500 text-sm">This creator hasn&apos;t uploaded any content yet</p>
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
                className="bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Load More Content
              </button>
            </div>
          )}
          
        </section>
      </main>

      <ContentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContent(null);
        }}
        content={selectedContent}
        contentService={contentService}
      />
    </div>
  );
}