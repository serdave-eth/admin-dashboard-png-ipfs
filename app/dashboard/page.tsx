'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Header from '@/components/UI/Header';
import UploadForm from '@/components/Upload/UploadForm';
import ContentFeed from '@/components/Content/ContentFeed';
import ZoraLinkingModal from '@/components/Auth/ZoraLinkingModal';
import WalletDisplaySection from '@/components/UI/WalletDisplaySection';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';

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
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
              <WalletDisplaySection primaryWallet={walletAddress} />
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              {/* Zora Coins Section */}
              {hasZoraLinked && zoraWallet?.smartWallet && (
                <div className="bg-black/10 rounded-3xl p-8 border border-black/20 hover:border-black/30 transition-all duration-300">
                  <h2 className="text-2xl font-anton text-black mb-6 tracking-wide">ZORA SMART WALLET COINS</h2>
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
                    <div className="text-black/70 font-bold">Loading coin balances...</div>
                  )}
                  
                  {zoraCoins.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-black/70 font-bold">Found {zoraCoins.length} coin(s) where you are an owner:</p>
                      {zoraCoins.map((balance, index) => (
                        <div key={balance.id || index} className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 hover:scale-105 transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-anton text-lg text-green-800 tracking-wide">
                                  {balance.coin?.name || 'Unknown Coin'}
                                </h3>
                                <span className="px-3 py-1 text-xs bg-green-600 text-white rounded-full font-bold">
                                  OWNER
                                </span>
                              </div>
                              {balance.coin?.symbol && (
                                <p className="text-sm text-black/70 font-bold">({balance.coin.symbol})</p>
                              )}
                              {balance.coin?.address && (
                                <p className="text-xs text-black/50 font-mono break-all bg-black/5 p-2 rounded-lg mt-2">
                                  Contract: {balance.coin.address}
                                </p>
                              )}
                              {balance.coin?.description && (
                                <p className="text-sm text-black/70 mt-2 bg-black/5 p-2 rounded-lg">{balance.coin.description.replace(/"/g, '&quot;')}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-right">
                                <p className="font-anton text-green-800 text-lg">
                                  Balance: {balance.balanceDecimal ? balance.balanceDecimal.toLocaleString(undefined, { maximumFractionDigits: 6 }) : balance.balance}
                                </p>
                                {balance.balanceDecimal && balance.balance !== balance.balanceDecimal.toString() && (
                                  <p className="text-xs text-black/50 font-mono">
                                    Raw: {parseInt(balance.balance).toLocaleString()}
                                  </p>
                                )}
                                {balance.decimals && (
                                  <p className="text-xs text-black/50">
                                    Decimals: {balance.decimals}
                                  </p>
                                )}
                              </div>
                              {balance.coin?.marketCap && (
                                <p className="text-sm text-black/70 font-bold">
                                  Market Cap: ${parseFloat(balance.coin.marketCap).toLocaleString()}
                                </p>
                              )}
                              {balance.coin?.uniqueHolders && (
                                <p className="text-sm text-black/70 font-bold">
                                  Holders: {balance.coin.uniqueHolders}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isLoadingCoins && !coinsError ? (
                    <div className="text-black/70 bg-black/5 rounded-2xl p-6">
                      <p className="font-bold">No coins found where you are an owner.</p>
                      <p className="text-sm mt-1">This means the Zora smart wallet is not in the owners array for any of the coins you have balances in.</p>
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