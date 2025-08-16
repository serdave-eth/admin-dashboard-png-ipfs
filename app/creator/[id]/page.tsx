'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { ArrowLeft, Lock, Unlock, Heart, MessageCircle, Share, Users, TrendingUp, Coins } from 'lucide-react';
import LoginButton from '@/components/Auth/LoginButton';

interface Creator {
  id: string;
  name: string;
  symbol: string;
  address: string;
  marketCap: string;
  holders: number;
  volume24h: string;
  imageUrl: string;
  description: string;
  minTokensRequired: number;
}

interface ContentItem {
  id: string;
  type: 'image' | 'video' | 'text' | 'audio';
  title: string;
  description: string;
  timestamp: string;
  imageUrl?: string;
  isLocked: boolean;
  requiredTokens: number;
  likes: number;
  comments: number;
}

export default function CreatorPage() {
  const router = useRouter();
  const params = useParams();
  const { authenticated, user } = usePrivy();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Mock creators data
  const creatorsData: { [key: string]: Creator } = {
    'higher': {
      id: 'higher',
      name: 'higher',
      symbol: 'HIGHER',
      address: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe',
      marketCap: '15000000',
      holders: 12500,
      volume24h: '2500000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=higher&backgroundColor=b6e3f4',
      description: 'Building the future of onchain creativity and community. Join us as we go higher together! 🚀',
      minTokensRequired: 1000,
    },
    'imagine': {
      id: 'imagine',
      name: 'Imagine',
      symbol: 'IMAGINE',
      address: '0x078540eecc8b6d89949c9c7d5e8e91eab64f6696',
      marketCap: '8000000',
      holders: 8200,
      volume24h: '1200000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=imagine&backgroundColor=c0aede',
      description: 'Imagining new possibilities in the creator economy. Exclusive content for true believers.',
      minTokensRequired: 500,
    },
    'enjoy': {
      id: 'enjoy',
      name: 'ENJOY',
      symbol: 'ENJOY',
      address: '0xa6B280B42CB0b7c4a4F789eC6cCC3a7609A1Bc39',
      marketCap: '5000000',
      holders: 6500,
      volume24h: '800000',
      imageUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=enjoy&backgroundColor=ffd5dc',
      description: 'Spreading joy through art, music, and community. Enjoy the journey with exclusive perks!',
      minTokensRequired: 250,
    },
  };

  // Mock content data
  const mockContent: ContentItem[] = [
    {
      id: '1',
      type: 'image',
      title: 'Behind the Scenes: Studio Session',
      description: 'Exclusive look at our latest creative process. Only for true supporters!',
      timestamp: '2 hours ago',
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      isLocked: false,
      requiredTokens: 100,
      likes: 47,
      comments: 12,
    },
    {
      id: '2',
      type: 'video',
      title: 'Early Access: New Track Preview',
      description: 'Get the first listen to our upcoming release. Your support makes this possible!',
      timestamp: '1 day ago',
      imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=300&fit=crop',
      isLocked: true,
      requiredTokens: 500,
      likes: 156,
      comments: 34,
    },
    {
      id: '3',
      type: 'text',
      title: 'Community Update & Future Plans',
      description: 'Important updates about our roadmap and exciting announcements coming soon.',
      timestamp: '3 days ago',
      isLocked: false,
      requiredTokens: 50,
      likes: 89,
      comments: 23,
    },
    {
      id: '4',
      type: 'image',
      title: 'Exclusive NFT Drop Preview',
      description: 'First look at our upcoming NFT collection. Holders get priority access!',
      timestamp: '5 days ago',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
      isLocked: true,
      requiredTokens: 1000,
      likes: 203,
      comments: 67,
    },
    {
      id: '5',
      type: 'audio',
      title: 'Voice Message from the Creator',
      description: 'Personal message thanking our community and sharing upcoming projects.',
      timestamp: '1 week ago',
      isLocked: false,
      requiredTokens: 25,
      likes: 124,
      comments: 45,
    },
  ];

  useEffect(() => {
    const creatorId = params.id as string;
    const foundCreator = creatorsData[creatorId];
    
    if (foundCreator) {
      setCreator(foundCreator);
      
      // Adjust content lock status based on creator
      let adjustedContent = [...mockContent];
      if (creatorId === 'imagine') {
        // For Imagine, show some content as unlocked
        adjustedContent = adjustedContent.map(item => ({
          ...item,
          isLocked: item.requiredTokens > 500 // Only lock high-requirement content
        }));
      }
      setContent(adjustedContent);
      
      // Mock user token balance (in real app, this would be fetched from blockchain)
      // For Imagine, always show as if user has tokens for demo purposes
      if (creatorId === 'imagine') {
        setUserTokenBalance(1500); // High balance for Imagine to show unlocked state
      } else if (creatorId === 'enjoy') {
        setUserTokenBalance(100); // Low balance for ENJOY to show insufficient funds
      } else if (authenticated) {
        setUserTokenBalance(Math.floor(Math.random() * 400)); // Low balance for others
      }
    }
    
    setLoading(false);
  }, [params.id, authenticated]);

  const hasAccess = (requiredTokens: number) => {
    // For Imagine demo, show access even when not authenticated
    if (params.id === 'imagine') {
      return userTokenBalance >= requiredTokens;
    }
    // For ENJOY demo, show as authenticated but with limited access based on balance
    if (params.id === 'enjoy') {
      return userTokenBalance >= requiredTokens;
    }
    return authenticated && userTokenBalance >= requiredTokens;
  };

  const ContentCard = ({ item }: { item: ContentItem }) => {
    const canAccess = hasAccess(item.requiredTokens);
    const isLocked = item.isLocked && !canAccess;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
        {item.imageUrl && (
          <div className="relative h-48 bg-gray-100">
            <img
              src={item.imageUrl}
              alt={item.title}
              className={`w-full h-full object-cover ${isLocked ? 'blur-md' : ''}`}
            />
            {isLocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">Hold {item.requiredTokens} {creator?.symbol}</p>
                  <p className="text-xs opacity-80">to unlock this content</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold text-black mb-2 ${isLocked ? 'blur-sm' : ''}`}>
                {item.title}
              </h3>
              <p className={`text-gray-600 text-sm ${isLocked ? 'blur-sm' : ''}`}>
                {item.description}
              </p>
            </div>
            <span className="text-xs text-gray-500 ml-4">{item.timestamp}</span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="text-sm">{item.likes}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{item.comments}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                <Share className="w-4 h-4" />
              </button>
            </div>
            
            {isLocked && (
              <div className="flex items-center text-orange-600 text-xs">
                <Lock className="w-3 h-3 mr-1" />
                {item.requiredTokens} {creator?.symbol} required
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-2">Creator Not Found</h1>
          <p className="text-gray-600 mb-4">The creator you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/explore')}
            className="bg-black text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/explore')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-black tracking-tight">
                Backstage
              </h1>
            </div>
            
            <div className="flex items-center">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={creator.imageUrl}
              alt={creator.name}
              className="w-24 h-24 rounded-full border-4 border-gray-100"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-black">{creator.name}</h1>
                <span className="text-gray-500">${creator.symbol}</span>
              </div>
              
              <p className="text-gray-600 mb-4 max-w-2xl">{creator.description}</p>
              
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <Coins className="w-4 h-4" /> Market Cap
                  </p>
                  <p className="font-semibold text-lg">${parseFloat(creator.marketCap).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" /> Holders
                  </p>
                  <p className="font-semibold text-lg">{creator.holders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> 24h Volume
                  </p>
                  <p className="font-semibold text-lg">${parseFloat(creator.volume24h).toLocaleString()}</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Balance/Access Status - For Imagine and ENJOY */}
        {params.id === 'imagine' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-semibold text-lg">
                  Your Balance: {userTokenBalance.toLocaleString()} {creator?.symbol}
                </p>
              </div>
              <div className="flex items-center text-green-600">
                <Unlock className="w-5 h-5 mr-2" />
                <span className="font-semibold">Full Access Unlocked</span>
              </div>
            </div>
          </div>
        )}


        {/* Content Feed */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Exclusive Content</h2>
          
          {!authenticated && params.id !== 'imagine' && params.id !== 'enjoy' ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-6">
                Hold {creator?.minTokensRequired.toLocaleString()} {creator?.symbol} to unlock all content
              </h3>
              <LoginButton />
            </div>
          ) : params.id === 'enjoy' ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black mb-6">
                Hold {creator?.minTokensRequired.toLocaleString()} {creator?.symbol} to unlock all content
              </h3>
              <p className="text-gray-600 mb-6">
                You currently have {userTokenBalance} {creator?.symbol}. You need {(creator?.minTokensRequired - userTokenBalance).toLocaleString()} more.
              </p>
              <button className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors">
                Buy {(creator?.minTokensRequired - userTokenBalance).toLocaleString()} {creator?.symbol}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}