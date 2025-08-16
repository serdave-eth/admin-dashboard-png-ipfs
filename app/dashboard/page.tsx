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
      <div className="min-h-screen bg-gray-50">
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
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h2 className="text-xl font-bold mb-6">Zora Smart Wallet Coins</h2>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-2">
                      Smart Wallet: {zoraWallet.smartWallet}
                    </p>
                    <button
                      onClick={fetchZoraCoins}
                      disabled={isLoadingCoins}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoadingCoins ? 'Loading...' : 'Refresh Coins'}
                    </button>
                  </div>
                  
                  {coinsError && (
                    <div className="text-red-600 mb-4">{coinsError}</div>
                  )}
                  
                  {isLoadingCoins && (
                    <div className="text-gray-600">Loading coin balances...</div>
                  )}
                  
                  {zoraCoins.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-gray-600">Found {zoraCoins.length} coin(s) where you are an owner:</p>
                      {zoraCoins.map((balance, index) => (
                        <div key={balance.id || index} className="border rounded-lg p-4 bg-green-50 border-green-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-green-800">
                                  {balance.coin?.name || 'Unknown Coin'}
                                </h3>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  Owner
                                </span>
                              </div>
                              {balance.coin?.symbol && (
                                <p className="text-sm text-gray-600">({balance.coin.symbol})</p>
                              )}
                              {balance.coin?.address && (
                                <p className="text-xs text-gray-500 font-mono break-all">
                                  Contract: {balance.coin.address}
                                </p>
                              )}
                              {balance.coin?.description && (
                                <p className="text-sm text-gray-500 mt-1">{balance.coin.description.replace(/"/g, '&quot;')}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-right">
                                <p className="font-medium text-green-800">
                                  Balance: {balance.balanceDecimal ? balance.balanceDecimal.toLocaleString(undefined, { maximumFractionDigits: 6 }) : balance.balance}
                                </p>
                                {balance.balanceDecimal && balance.balance !== balance.balanceDecimal.toString() && (
                                  <p className="text-xs text-gray-500">
                                    Raw: {parseInt(balance.balance).toLocaleString()}
                                  </p>
                                )}
                                {balance.decimals && (
                                  <p className="text-xs text-gray-500">
                                    Decimals: {balance.decimals}
                                  </p>
                                )}
                              </div>
                              {balance.coin?.marketCap && (
                                <p className="text-sm text-gray-600">
                                  Market Cap: ${parseFloat(balance.coin.marketCap).toLocaleString()}
                                </p>
                              )}
                              {balance.coin?.uniqueHolders && (
                                <p className="text-sm text-gray-600">
                                  Holders: {balance.coin.uniqueHolders}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !isLoadingCoins && !coinsError ? (
                    <div className="text-gray-500">
                      <p>No coins found where you are an owner.</p>
                      <p className="text-sm mt-1">This means the Zora smart wallet is not in the owners array for any of the coins you have balances in.</p>
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Content Section */}
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-xl font-bold mb-6">Your Content</h2>
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