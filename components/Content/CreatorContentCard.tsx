'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ZoraCoinInfo } from '@/types';
import { ZoraContent } from '@/lib/hooks/useZoraCreators';
import { Heart, Eye, Lock, Play, FileText, Music, Image as ImageIcon } from 'lucide-react';
import { getCoin } from '@zoralabs/coins-sdk';

interface CreatorContentCardProps {
  content: ZoraContent;
  isUnlocked: boolean;
  userBalance: number;
  coinAddress?: string;
}

const CreatorContentCard: React.FC<CreatorContentCardProps> = ({ 
  content, 
  isUnlocked, 
  userBalance, 
  coinAddress 
}) => {
  const [zoraCoinInfo, setZoraCoinInfo] = useState<ZoraCoinInfo | null>(null);
  const [isLoadingCoin, setIsLoadingCoin] = useState(false);
  const [coinError, setCoinError] = useState<string | null>(null);

  // Fetch Zora coin information if coinAddress is provided
  useEffect(() => {
    const fetchZoraCoinInfo = async () => {
      if (!coinAddress) return;

      setIsLoadingCoin(true);
      setCoinError(null);

      try {
        const response = await getCoin({
          address: coinAddress,
        });

        if (response.data?.zora20Token) {
          const coin = response.data.zora20Token;
          const coinInfo: ZoraCoinInfo = {
            address: coin.address || coinAddress,
            name: coin.name || 'Unknown Coin',
            symbol: coin.symbol || 'UNKNOWN',
            totalSupply: coin.totalSupply || '0',
            marketCap: coin.marketCap || '0',
            price: coin.marketCap ? parseFloat(coin.marketCap) / parseFloat(coin.totalSupply || '1') : 0,
            holders: coin.uniqueHolders || 0,
            volume24h: coin.volume24h || '0',
            description: coin.description,
            mediaContent: coin.mediaContent,
          };
          setZoraCoinInfo(coinInfo);
        }
      } catch (error) {
        console.error('Failed to fetch Zora coin info:', error);
        setCoinError('Failed to load coin information');
      } finally {
        setIsLoadingCoin(false);
      }
    };

    fetchZoraCoinInfo();
  }, [coinAddress]);

  const getContentIcon = () => {
    switch (content.type) {
      case 'video':
        return <Play className="w-6 h-6 text-white" />;
      case 'audio':
        return <Music className="w-6 h-6 text-white" />;
      case 'text':
        return <FileText className="w-6 h-6 text-white" />;
      default:
        return <ImageIcon className="w-6 h-6 text-white" />;
    }
  };

  const getContentTypeColor = () => {
    switch (content.type) {
      case 'video':
        return 'bg-red-500';
      case 'audio':
        return 'bg-purple-500';
      case 'text':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="group bg-black/10 rounded-2xl overflow-hidden border border-black/20 hover:border-black/30 transition-all duration-300 hover:scale-105">
      {/* Content Preview */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={content.thumbnail}
          alt={content.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content Type Icon */}
        <div className={`absolute top-3 left-3 ${getContentTypeColor()} rounded-full p-2`}>
          {getContentIcon()}
        </div>

        {/* Premium Badge */}
        {content.isPremium && (
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
                {content.requiredBalance} tokens required
              </p>
              <p className="text-white/70 text-xs">
                You have {userBalance}
              </p>
            </div>
          </div>
        )}

        {/* Stats in bottom corner */}
        <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-sm">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{content.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{content.views}</span>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4">
        <h3 className="font-anton text-lg text-black mb-2 tracking-wide truncate">
          {content.title.toUpperCase()}
        </h3>
        <p className="text-black/70 text-sm mb-3 line-clamp-2">
          {content.description}
        </p>

        {/* Zora Coin Information */}
        {coinAddress && (
          <div className="mb-3 p-3 bg-black/5 rounded-xl border border-black/10">
            {isLoadingCoin ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span className="text-black/70 text-xs">Loading coin info...</span>
              </div>
            ) : coinError ? (
              <p className="text-red-600 text-xs">{coinError}</p>
            ) : zoraCoinInfo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {zoraCoinInfo.mediaContent?.previewImage?.small && (
                      <Image
                        src={zoraCoinInfo.mediaContent.previewImage.small}
                        alt={zoraCoinInfo.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-black font-bold text-sm">${zoraCoinInfo.symbol}</span>
                  </div>
                  <span className="text-black/70 text-xs">
                    {zoraCoinInfo.holders} holders
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-black/70">Market Cap:</span>
                  <span className="text-black font-bold">
                    ${parseFloat(zoraCoinInfo.marketCap).toLocaleString()}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Access Requirements */}
        {content.isPremium && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ) : (
                <Lock className="w-3 h-3 text-black/50" />
              )}
              <span className="text-xs text-black/70">
                {isUnlocked ? 'Unlocked' : `${content.requiredBalance} tokens needed`}
              </span>
            </div>
            <span className="text-xs text-black/50">
              {new Date(content.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button 
          className={`w-full mt-3 py-2 px-4 rounded-full font-bold text-sm transition-all duration-200 ${
            isUnlocked 
              ? 'bg-black text-yellow-400 hover:scale-105' 
              : 'bg-black/20 text-black/50 cursor-not-allowed'
          }`}
          disabled={!isUnlocked}
        >
          {isUnlocked ? 'View Content' : 'Locked'}
        </button>
      </div>
    </div>
  );
};

export default CreatorContentCard;