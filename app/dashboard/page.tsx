'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UploadForm from '@/components/Upload/UploadForm';
import ContentFeed from '@/components/Content/ContentFeed';
import ZoraLinkingModal from '@/components/Auth/ZoraLinkingModal';
import WalletDisplaySection from '@/components/UI/WalletDisplaySection';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';
import CreatorAvatar from '@/components/UI/CreatorAvatar';
import Link from 'next/link';

export default function Dashboard() {
  const { user, authenticated } = usePrivy();
  const { 
    hasZoraLinked, 
    zoraWallet, 
    fetchZoraCoins, 
    zoraCoins, 
    isLoadingCoins, 
    coinsError 
  } = useZoraLinking();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showZoraModal, setShowZoraModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  // Handle both external and embedded wallets
  const walletAddress = user?.wallet?.address || 
    user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
    '';

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Show Zora linking modal after successful authentication if not already linked
  useEffect(() => {
    if (authenticated && !hasZoraLinked && !hasShownModal) {
      // Small delay to let the dashboard load first
      const timer = setTimeout(() => {
        setShowZoraModal(true);
        setHasShownModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [authenticated, hasZoraLinked, hasShownModal]);

  // Automatically fetch Zora coins when wallet is available
  useEffect(() => {
    if (zoraWallet?.smartWallet && zoraCoins.length === 0) {
      console.log('Auto-fetching Zora coins for wallet:', zoraWallet.smartWallet);
      fetchZoraCoins();
    }
  }, [zoraWallet?.smartWallet, zoraCoins.length, fetchZoraCoins]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{backgroundColor: '#F6CA46'}}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
              <WalletDisplaySection primaryWallet={walletAddress} />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {/* Creator Coins Section */}
              {hasZoraLinked && zoraWallet?.smartWallet && (
                <div className="bg-black/10 rounded-3xl p-8 border border-black/20 hover:border-black/30 transition-all duration-300">
                  <h2 className="text-2xl font-anton text-black mb-6 tracking-wide">YOUR CREATOR COINS</h2>
                  <div className="mb-4">
                    <p className="text-black/70 mb-2 font-mono text-sm">
                      Smart Wallet: {zoraWallet.smartWallet}
                    </p>
                    <button
                      onClick={fetchZoraCoins}
                      disabled={isLoadingCoins}
                      className="bg-black text-yellow-400 px-6 py-3 rounded-full font-bold hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isLoadingCoins ? 'Loading...' : 'Refresh Coins'}
                    </button>
                  </div>
                  
                  {coinsError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-800 font-bold mb-4">{coinsError}</div>
                  )}
                  
                  {isLoadingCoins && (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                      <p className="text-black/70 mt-2">Loading your creator coins...</p>
                    </div>
                  )}
                  
                  {zoraCoins.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {zoraCoins.map((balance, index) => (
                        <Link key={`${balance.id || balance.coin?.address || 'unknown'}-${index}`} href={`/creator/${balance.coin?.address}`}>
                          <div className="group bg-black/10 rounded-2xl p-4 border border-black/20 hover:border-black/30 transition-all duration-300 hover:scale-105 cursor-pointer">
                            <div className="flex items-center gap-3 mb-3">
                              <CreatorAvatar
                                src={balance.coin?.mediaContent?.previewImage?.small}
                                alt={balance.coin?.name || 'Creator'}
                                symbol={balance.coin?.symbol || '?'}
                                size={48}
                              />
                              <div>
                                <h3 className="font-anton text-black tracking-wide text-sm">
                                  {(balance.coin?.name || 'Unknown Creator').toUpperCase()}
                                </h3>
                                <p className="text-black/70 text-xs">${balance.coin?.symbol || 'UNKNOWN'}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                              <div className="bg-black/10 rounded-lg p-2 text-center">
                                <div className="text-black/70">Your Balance</div>
                                <div className="text-black font-bold">
                                  {balance.balanceDecimal ? balance.balanceDecimal.toFixed(2) : '0'}
                                </div>
                              </div>
                              <div className="bg-black/10 rounded-lg p-2 text-center">
                                <div className="text-black/70">Holders</div>
                                <div className="text-black font-bold">{balance.coin?.uniqueHolders || 0}</div>
                              </div>
                            </div>
                            
                            {balance.coin?.marketCap && parseFloat(balance.coin.marketCap) > 0 && (
                              <div className="text-xs text-center">
                                <span className="text-black/70">Market Cap: </span>
                                <span className="text-black font-bold">
                                  ${parseFloat(balance.coin.marketCap).toLocaleString()}
                                </span>
                              </div>
                            )}
                            
                            <div className="mt-2 text-center">
                              {balance.isOwner ? (
                                <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full font-bold">
                                  🎨 CREATOR
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full font-bold">
                                  💎 HOLDER
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : !isLoadingCoins && !coinsError ? (
                    <div className="text-center py-8">
                      <p className="text-black/70 font-bold">No creator coins found in your wallet.</p>
                      <p className="text-black/50 text-sm mt-2">Purchase some creator coins to see them here!</p>
                    </div>
                  ) : null}
                </div>
              )}
              

              {/* Content Section */}
              <div className="bg-black/10 rounded-3xl p-8 border border-black/20 hover:border-black/30 transition-all duration-300">
                <h2 className="text-2xl font-anton text-black mb-6 tracking-wide">YOUR CONTENT</h2>
                <ContentFeed refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
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