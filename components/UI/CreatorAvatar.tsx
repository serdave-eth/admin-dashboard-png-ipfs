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

  const handleImageError = () => {
    setImageError(true);
  };

  // Show fallback only if no src or image failed to load
  const showFallback = !src || imageError;

  return (
    <div className="relative rounded-full overflow-hidden" style={{ width: size, height: size }}>
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          onError={handleImageError}
          unoptimized
        />
      ) : (
        <div 
          className="bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center w-full h-full"
        >
          <span 
            className="text-white font-bold" 
            style={{ fontSize: Math.max(12, size / 3) }}
          >
            {symbol.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export default CreatorAvatar;