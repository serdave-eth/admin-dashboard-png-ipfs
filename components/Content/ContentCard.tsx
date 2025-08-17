'use client';

import { useState } from 'react';
import { ContentItem } from '@/types';
import { formatFileSize, getFileIcon, formatDate } from '@/lib/utils';
import { Copy, ExternalLink, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ContentCard({ 
  item, 
  onDelete 
}: { 
  item: ContentItem;
  onDelete?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const decryptedImageUrl = `/api/decrypt-image/${item.ipfsCid}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(item.ipfsCid);
      setCopied(true);
      toast.success('CID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy CID');
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      toast.success('Content deleted successfully');
    } catch (error) {
      toast.error('Failed to delete content');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{getFileIcon(item.fileType)}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {formatDate(item.createdAt)}
          </span>
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
              title="Delete content"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <h3 className="font-medium text-gray-900 truncate mb-2" title={item.filename}>
        {item.filename}
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Size:</span>
          <span className="text-gray-700">{formatFileSize(item.fileSize)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Type:</span>
          <span className="text-gray-700">{item.fileType}</span>
        </div>

        {/* Coin Requirements */}
        {item.coinContractAddress && item.minimumTokenAmount && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-500 text-xs">Access Required:</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Token Gated
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Contract:</span>
                <span className="font-mono text-xs text-gray-600 truncate max-w-24" title={item.coinContractAddress}>
                  {item.coinContractAddress.slice(0, 6)}...{item.coinContractAddress.slice(-4)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">Min Amount:</span>
                <span className="text-xs text-gray-700 font-medium">
                  {parseFloat(item.minimumTokenAmount).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs">IPFS CID:</span>
            <button
              onClick={copyToClipboard}
              className="text-indigo-600 hover:text-indigo-700 transition-colors"
              title="Copy CID"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="font-mono text-xs text-gray-600 truncate" title={item.ipfsCid}>
            {item.ipfsCid}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <a
          href={decryptedImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Content
        </a>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Content</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{item.filename}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}