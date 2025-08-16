'use client';

import { ExternalLink, Check } from 'lucide-react';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface ZoraLinkButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ZoraLinkButton({ 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}: ZoraLinkButtonProps) {
  const { linkZora, isLinking, hasZoraLinked } = useZoraLinking();

  const baseClasses = 'inline-flex items-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  if (hasZoraLinked) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium ${className}`}>
        <Check className="w-4 h-4" />
        Zora Linked
      </div>
    );
  }

  return (
    <button
      onClick={linkZora}
      disabled={isLinking}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {isLinking ? (
        <>
          <LoadingSpinner size="sm" />
          Linking...
        </>
      ) : (
        <>
          <ExternalLink className="w-4 h-4" />
          Link Zora Account
        </>
      )}
    </button>
  );
}