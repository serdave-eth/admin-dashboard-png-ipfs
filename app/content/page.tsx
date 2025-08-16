'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Header from '@/components/UI/Header';
import ZoraLinkingModal from '@/components/Auth/ZoraLinkingModal';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import { ArrowLeft, LogOut, ChevronDown } from 'lucide-react';

export default function ContentPage() {
  const { user, authenticated } = usePrivy();
  const router = useRouter();
  const { 
    hasZoraLinked, 
    zoraWallet, 
    fetchZoraCoins, 
    zoraCoins, 
    isLoadingCoins, 
    coinsError 
  } = useZoraLinking();
  const [showZoraModal, setShowZoraModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  const walletAddress = user?.wallet?.address || 
    user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
    '';

  useEffect(() => {
    if (authenticated && !hasZoraLinked && !hasShownModal) {
      const timer = setTimeout(() => {
        setShowZoraModal(true);
        setHasShownModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [authenticated, hasZoraLinked, hasShownModal]);

  useEffect(() => {
    if (zoraWallet?.smartWallet && zoraCoins.length === 0) {
      console.log('Auto-fetching Zora coins for wallet:', zoraWallet.smartWallet);
      fetchZoraCoins();
    }
  }, [zoraWallet?.smartWallet, zoraCoins.length, fetchZoraCoins]);

  const handleCreatorClick = (creator: any) => {
    router.push(`/creator/${creator.coin?.address || creator.id}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <div className="text-2xl font-bold text-gray-900">
              My Creator Coins
            </div>
          </div>
          <div className="text-sm text-gray-600">
            {walletAddress && `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Zora Linking Status */}
          {!hasZoraLinked ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                Link Your Zora Account
              </h2>
              <p className="text-yellow-700 mb-4">
                To view your creator coins and access exclusive content, please link your Zora account.
              </p>
              <button
                onClick={() => setShowZoraModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Link Zora Account
              </button>
            </div>
          ) : (
            <>
              {/* Zora Wallet Info */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">Zora Smart Wallet</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      Smart Wallet: <span className="font-mono text-sm">{zoraWallet?.smartWallet}</span>
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={fetchZoraCoins}
                      disabled={isLoadingCoins}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isLoadingCoins ? 'Loading...' : 'Refresh Coins'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {coinsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                  <div className="text-red-600">{coinsError}</div>
                </div>
              )}
              
              {/* Loading State */}
              {isLoadingCoins && (
                <div className="text-center py-12">
                  <div className="text-gray-600">Loading your creator coins...</div>
                </div>
              )}
              
              {/* Creator Coins Grid */}
              {zoraCoins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {zoraCoins.map((balance, index) => (
                    <div 
                      key={balance.id || index} 
                      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleCreatorClick(balance)}
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {balance.coin?.name || 'Unknown Creator'}
                            </h3>
                            {balance.coin?.symbol && (
                              <p className="text-sm text-gray-600 mb-2">
                                ({balance.coin.symbol})
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Owner
                          </span>
                        </div>

                        <div className="flex-1">
                          {balance.coin?.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                              {balance.coin.description.replace(/"/g, '')}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Your Balance:</span>
                            <span className="font-medium text-green-800">
                              {balance.balanceDecimal ? 
                                balance.balanceDecimal.toLocaleString(undefined, { maximumFractionDigits: 6 }) : 
                                balance.balance
                              }
                            </span>
                          </div>
                          
                          {balance.coin?.marketCap && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Market Cap:</span>
                              <span className="text-sm text-gray-700">
                                ${parseFloat(balance.coin.marketCap).toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {balance.coin?.uniqueHolders && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Holders:</span>
                              <span className="text-sm text-gray-700">
                                {balance.coin.uniqueHolders}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <button 
                            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreatorClick(balance);
                            }}
                          >
                            View Exclusive Content
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !isLoadingCoins && !coinsError ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="text-lg mb-2">No creator coins found</p>
                    <p className="text-sm">
                      You don't own any creator coins yet. Browse creators on the home page to get started.
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Browse Creators
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </main>

        {/* Zora Linking Modal */}
        <ZoraLinkingModal
          isOpen={showZoraModal}
          onClose={() => setShowZoraModal(false)}
          showOnLogin={true}
        />
      </div>
    </ProtectedRoute>
  );
}