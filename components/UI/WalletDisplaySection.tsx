'use client';

import { useState } from 'react';
import { Copy, Check, Wallet, ExternalLink, Link, Trash2 } from 'lucide-react';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { toast } from 'sonner';

interface WalletDisplaySectionProps {
  primaryWallet: string;
  className?: string;
}

export default function WalletDisplaySection({ primaryWallet, className = '' }: WalletDisplaySectionProps) {
  const { zoraWallet, hasZoraLinked, linkZora, clearZoraLink, isLinking, isClearing } = useZoraLinking();
  const [copiedWallet, setCopiedWallet] = useState<'primary' | 'zora' | null>(null);

  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (address: string, type: 'primary' | 'zora') => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedWallet(type);
      toast.success(`${type === 'primary' ? 'Dashboard' : 'Zora'} wallet address copied!`);
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Wallets</h3>
      
      <div className="space-y-3">
        {/* Primary Wallet */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Wallet className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">Dashboard Wallet</p>
              <p className="text-sm font-mono text-gray-700" title={primaryWallet}>
                {truncateAddress(primaryWallet)}
              </p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(primaryWallet, 'primary')}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
            title="Copy address"
          >
            {copiedWallet === 'primary' ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Zora Wallet */}
        {hasZoraLinked && zoraWallet ? (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">Zora Wallet</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    Linked
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-700" title={zoraWallet.address}>
                  {truncateAddress(zoraWallet.address)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(zoraWallet.address, 'zora')}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Copy address"
              >
                {copiedWallet === 'zora' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={clearZoraLink}
                disabled={isClearing}
                className="p-1.5 text-red-400 hover:text-red-600 rounded disabled:opacity-50"
                title="Clear Zora linking"
              >
                {isClearing ? (
                  <div className="w-4 h-4 border border-red-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Link className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-700">Zora Wallet</p>
                <p className="text-sm text-gray-500">Not linked</p>
              </div>
            </div>
            <button
              onClick={linkZora}
              disabled={isLinking}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-50 transition-colors"
            >
              {isLinking ? (
                <>
                  <div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" />
                  Linking...
                </>
              ) : (
                <>
                  <ExternalLink className="w-3 h-3" />
                  Link Account
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-600 font-medium">
          {hasZoraLinked 
            ? 'Both wallets are connected and ready to use'
            : 'Link your Zora account for enhanced functionality'
          }
        </p>
      </div>
    </div>
  );
}