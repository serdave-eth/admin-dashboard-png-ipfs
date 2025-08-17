'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface CreatorAvatarProps {
  src?: string;
  alt: string;
  symbol?: string;
  size?: number;
}

const CreatorAvatar: React.FC<CreatorAvatarProps> = ({ 
  src, 
  alt, 
  symbol = '?', 
  size = 48 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Show fallback if no src, image failed to load, or image hasn't loaded yet
  const showFallback = !src || imageError || !imageLoaded;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {src && !imageError && (
        <Image
          src={src}
          alt={alt}
          fill
          className="rounded-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      )}
      
      {/* Fallback gradient avatar */}
      <div 
        className={`bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center ${showFallback ? '' : 'hidden'}`}
        style={{ width: size, height: size }}
      >
        <span 
          className="text-white font-bold" 
          style={{ fontSize: Math.max(12, size / 3) }}
        >
          {symbol.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export default CreatorAvatar;