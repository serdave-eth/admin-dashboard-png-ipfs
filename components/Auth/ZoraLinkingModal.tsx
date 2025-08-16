'use client';

import { useState, useEffect } from 'react';
import { X, Link, ExternalLink, AlertCircle } from 'lucide-react';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface ZoraLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  showOnLogin?: boolean;
}

export default function ZoraLinkingModal({ isOpen, onClose, showOnLogin = false }: ZoraLinkingModalProps) {
  const { linkZora, isLinking, error, hasZoraLinked, clearError } = useZoraLinking();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  useEffect(() => {
    if (hasZoraLinked && isOpen) {
      // Auto-close modal if Zora is successfully linked
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  }, [hasZoraLinked, isOpen, onClose]);

  const handleClose = () => {
    clearError();
    setShowError(false);
    onClose();
  };

  const handleLinkZora = async () => {
    setShowError(false);
    clearError();
    await linkZora();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Link className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {hasZoraLinked ? 'Zora Account Linked!' : 'Link Your Zora Account'}
              </h2>
              {showOnLogin && (
                <p className="text-sm text-gray-500">Complete your setup</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLinking}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {hasZoraLinked ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-2">Successfully linked!</p>
              <p className="text-gray-600 text-sm">Your Zora account is now connected to your dashboard.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Connect your Zora embedded wallet
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-600 text-xs font-medium">1</span>
                    </div>
                    <p>Access your Zora NFTs and collectibles directly in the dashboard</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-600 text-xs font-medium">2</span>
                    </div>
                    <p>Seamlessly manage multiple wallets in one interface</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-indigo-600 text-xs font-medium">3</span>
                    </div>
                    <p>Enhanced security through Zora&apos;s embedded wallet technology</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {showError && error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isLinking}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {showOnLogin ? 'Skip for now' : 'Cancel'}
                </button>
                <button
                  onClick={handleLinkZora}
                  disabled={isLinking}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
              </div>

              {/* Info Text */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                You&apos;ll be redirected to Zora to authorize the connection
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}