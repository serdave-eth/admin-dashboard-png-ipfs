'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ContentItem } from '@/types';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: ContentItem | null;
  contentService: {
    buildContentImageUrl: (ipfsCid: string) => string;
  };
}

export default function ContentModal({
  isOpen,
  onClose,
  content,
  contentService
}: ContentModalProps) {
  if (!isOpen || !content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-[95vw] max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-black truncate pr-4">
            {content.filename}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Image Content */}
        <div className="overflow-auto max-h-[calc(95vh-80px)]">
          <div className="relative w-full">
            <img
              src={contentService.buildContentImageUrl(content.ipfsCid)}
              alt={content.filename}
              className="w-full h-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                // Don't try to load placeholder, just hide the broken image
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
