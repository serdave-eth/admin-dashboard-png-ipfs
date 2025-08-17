'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCoin } from '@zoralabs/coins-sdk';
import { useZoraLinking } from './useZoraLinking';

export interface ZoraCreatorData {
  id: string;
  coinAddress: string;
  name: string;
  symbol: string;
  description?: string;
  profileImage?: string;
  totalSupply: string;
  marketCap?: string;
  uniqueHolders?: number;
  volume24h?: string;
  price?: number;
  userBalance: string;
  userBalanceDecimal?: number;
  decimals?: number;
  creatorAddress?: string;
  mediaContent?: {
    previewImage?: {
      small?: string;
      medium?: string;
    };
  };
}

export interface ZoraContent {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text' | 'audio';
  thumbnail: string;
  url: string;
  description: string;
  requiredBalance: number;
  createdAt: string;
  likes: number;
  views: number;
  isPremium: boolean;
  coinAddress: string;
  creatorAddress?: string;
}

export interface UseZoraCreatorsReturn {
  creators: ZoraCreatorData[];
  isLoading: boolean;
  error: string | null;
  fetchCreators: () => Promise<void>;
  getCreatorById: (coinAddress: string) => Promise<ZoraCreatorData | null>;
  generateCreatorContent: (coinAddress: string) => ZoraContent[];
}

export const useZoraCreators = (): UseZoraCreatorsReturn => {
  const { zoraWallet, zoraCoins } = useZoraLinking();
  const [creators, setCreators] = useState<ZoraCreatorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert Zora coin balances to creator data
  const convertCoinsToCreators = useCallback((coinBalances: Array<{
    id: string;
    balance: string;
    balanceDecimal?: number;
    decimals?: number;
    coin?: {
      address?: string;
      name?: string;
      description?: string;
      symbol?: string;
      totalSupply?: string;
      marketCap?: string;
      uniqueHolders?: number;
      volume24h?: string;
      creatorAddress?: string;
      mediaContent?: {
        previewImage?: {
          small?: string;
          medium?: string;
        };
      };
    };
  }>): ZoraCreatorData[] => {
    return coinBalances.map((balance, index) => {
      const coin = balance.coin;
      const balanceDecimal = balance.balanceDecimal || 0;
      
      return {
        id: coin?.address || `creator-${index}`,
        coinAddress: coin?.address || '',
        name: coin?.name || 'Unknown Creator',
        symbol: coin?.symbol || 'UNKNOWN',
        description: coin?.description || 'Creator on Zora',
        profileImage: coin?.mediaContent?.previewImage?.medium || 
                     coin?.mediaContent?.previewImage?.small || 
                     `/api/placeholder/150/150`,
        totalSupply: coin?.totalSupply || '0',
        marketCap: coin?.marketCap || '0',
        uniqueHolders: coin?.uniqueHolders || 0,
        volume24h: coin?.volume24h || '0',
        price: coin?.marketCap && coin?.totalSupply ? 
               parseFloat(coin.marketCap) / parseFloat(coin.totalSupply) : 0,
        userBalance: balance.balance || '0',
        userBalanceDecimal: balanceDecimal,
        decimals: balance.decimals || 18,
        creatorAddress: coin?.creatorAddress,
        mediaContent: coin?.mediaContent,
      };
    });
  }, []);

  // Fetch creators based on user's coin holdings
  const fetchCreators = useCallback(async () => {
    if (!zoraWallet?.smartWallet) {
      setError('No Zora smart wallet available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the already fetched zora coins from useZoraLinking
      const creatorData = convertCoinsToCreators(zoraCoins);
      setCreators(creatorData);
    } catch (err: unknown) {
      console.error('Failed to fetch creators:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch creators';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [zoraWallet?.smartWallet, zoraCoins, convertCoinsToCreators]);

  // Get specific creator by coin address
  const getCreatorById = useCallback(async (coinAddress: string): Promise<ZoraCreatorData | null> => {
    try {
      const response = await getCoin({
        address: coinAddress,
      });

      if (response.data?.zora20Token) {
        const coin = response.data.zora20Token;
        
        // Get user's balance for this coin
        console.log('=== GETTING USER BALANCE IN getCreatorById ===');
        console.log('Looking for coinAddress:', coinAddress);
        console.log('Available zoraCoins:', zoraCoins?.length || 0);
        console.log('zoraCoins addresses:', zoraCoins?.map(zc => zc.coin?.address));
        
        const userCoin = zoraCoins.find(zc => zc.coin?.address === coinAddress);
        console.log('Found userCoin:', userCoin);
        
        const userBalance = userCoin?.balance || '0';
        const userBalanceDecimal = userCoin?.balanceDecimal || 0;
        const decimals = userCoin?.decimals || 18;
        
        console.log('Extracted balance data:', {
          userBalance,
          userBalanceDecimal,
          decimals
        });

        return {
          id: coin.address,
          coinAddress: coin.address,
          name: coin.name || 'Unknown Creator',
          symbol: coin.symbol || 'UNKNOWN',
          description: coin.description || 'Creator on Zora',
          profileImage: coin.mediaContent?.previewImage?.medium || 
                       coin.mediaContent?.previewImage?.small || 
                       `/api/placeholder/150/150`,
          totalSupply: coin.totalSupply || '0',
          marketCap: coin.marketCap || '0',
          uniqueHolders: coin.uniqueHolders || 0,
          volume24h: coin.volume24h || '0',
          price: coin.marketCap && coin.totalSupply ? 
                 parseFloat(coin.marketCap) / parseFloat(coin.totalSupply) : 0,
          userBalance,
          userBalanceDecimal,
          decimals,
          creatorAddress: coin.creatorAddress,
          mediaContent: coin.mediaContent,
        };
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch creator by ID:', err);
      return null;
    }
  }, [zoraCoins]);

  // Generate mock content for a creator (can be replaced with real content fetching later)
  const generateCreatorContent = useCallback((coinAddress: string): ZoraContent[] => {
    const creator = creators.find(c => c.coinAddress === coinAddress);
    if (!creator) return [];

    const contentTypes: ZoraContent['type'][] = ['image', 'video', 'text', 'audio'];
    const contents: ZoraContent[] = [];
    const contentCount = Math.min(24, Math.max(8, Math.floor(Math.random() * 20) + 5));

    for (let i = 1; i <= contentCount; i++) {
      const type = contentTypes[Math.floor(Math.random() * contentTypes.length)];
      const isPremium = Math.random() > 0.3; // 70% premium content
      const requiredBalance = isPremium ? Math.floor(Math.random() * (creator.userBalanceDecimal || 10)) + 1 : 0;
      
      contents.push({
        id: `${coinAddress}-content-${i}`,
        title: `${getContentTitle(type)} #${i}`,
        type,
        thumbnail: `/api/placeholder/300/200`,
        url: `/api/placeholder/800/600`,
        description: getContentDescription(type, i, creator.name),
        requiredBalance,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        likes: Math.floor(Math.random() * 500) + 10,
        views: Math.floor(Math.random() * 2000) + 50,
        isPremium,
        coinAddress,
        creatorAddress: creator.creatorAddress,
      });
    }

    return contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [creators]);

  // Auto-fetch creators when zora coins are available
  useEffect(() => {
    if (zoraCoins.length > 0) {
      fetchCreators();
    }
  }, [zoraCoins, fetchCreators]);

  return {
    creators,
    isLoading,
    error,
    fetchCreators,
    getCreatorById,
    generateCreatorContent,
  };
};

// Helper functions for content generation
function getContentTitle(type: ZoraContent['type']): string {
  const titles = {
    image: ['Exclusive Art', 'Behind the Scenes', 'Studio Shot', 'Concept Art', 'Digital Creation'],
    video: ['Tutorial', 'Live Session', 'Exclusive Interview', 'Behind the Scenes', 'Creator Update'],
    text: ['Strategy Guide', 'Market Analysis', 'Exclusive Insights', 'Community Update', 'Creator Notes'],
    audio: ['Podcast Episode', 'Music Track', 'Voice Note', 'Audio Guide', 'Sound Design'],
  };
  
  const typeOptions = titles[type];
  return typeOptions[Math.floor(Math.random() * typeOptions.length)];
}

function getContentDescription(type: ZoraContent['type'], index: number, creatorName: string): string {
  const descriptions = {
    image: `Exclusive visual content from ${creatorName} showcasing unique perspectives and artistic vision. Content piece ${index}.`,
    video: `Premium video content from ${creatorName} with in-depth coverage and exclusive access. Episode ${index}.`,
    text: `Detailed written content by ${creatorName} with valuable insights and exclusive information. Article ${index}.`,
    audio: `High-quality audio content from ${creatorName} with exclusive commentary and discussions. Track ${index}.`,
  };
  
  return descriptions[type];
}