'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import UploadForm from '@/components/Upload/UploadForm';
import ContentFeed from '@/components/Content/ContentFeed';
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
    coinsError,
    linkZora,
    isLinking,
    clearZoraLink,
    isClearing 
  } = useZoraLinking();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeSection, setActiveSection] = useState<'creators' | 'supporters' | 'wallets'>('creators');

  // Handle both external and embedded wallets
  const walletAddress = user?.wallet?.address || 
    user?.linkedAccounts?.find(account => account.type === 'wallet')?.address || 
    '';

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  // Automatically fetch Zora coins when wallet is available
  useEffect(() => {
    if (zoraWallet?.smartWallet && zoraCoins.length === 0) {
      console.log('Auto-fetching Zora coins for wallet:', zoraWallet.smartWallet);
      fetchZoraCoins();
    }
  }, [zoraWallet?.smartWallet, zoraCoins.length, fetchZoraCoins]);

  const renderCreatorsSection = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">YOUR CREATOR COINS</h1>
        <p className="text-gray-600">Manage the creator coins you own</p>
      </div>

      {hasZoraLinked && zoraWallet?.smartWallet ? (
        <>

          {isLoadingCoins && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
              <p className="text-black mt-2">Loading your creator coins...</p>
            </div>
          )}
          
          {coinsError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-800 font-bold mb-4">{coinsError}</div>
          )}
          
          {zoraCoins.length > 0 && zoraCoins.filter(balance => balance.isOwner).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoraCoins.filter(balance => balance.isOwner).map((balance, index) => (
                <Link key={`creator-${balance.id || balance.coin?.address || 'unknown'}-${index}`} href={`/creator/${balance.coin?.address}`}>
                  <div className="group bg-white rounded-2xl p-4 border border-gray-200 hover:border-black transition-all duration-300 hover:scale-105 cursor-pointer">
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
                      <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                        <div className="text-gray-600">Your Balance</div>
                        <div className="text-black font-bold">
                          {balance.balanceDecimal ? Math.floor(balance.balanceDecimal).toString() : '0'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                        <div className="text-gray-600">Holders</div>
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
                      <span className="px-2 py-1 text-xs bg-black text-white rounded-full font-bold">
                        🎨 CREATOR
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !isLoadingCoins && !coinsError ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <p className="text-xl font-semibold text-gray-800 mb-2">No creator coins found.</p>
                <p className="text-gray-600">Create your first creator coin to see it here</p>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-black font-bold mb-2">Connect your Zora account to see your creator coins</p>
          <button
            onClick={linkZora}
            disabled={isLinking}
            className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLinking ? 'Linking...' : 'Link Zora Account'}
          </button>
        </div>
      )}

      {/* Upload and Content Sections - Only show when Zora is linked */}
      {hasZoraLinked && zoraWallet?.smartWallet && (
        <>
          {/* Upload Section */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-black mb-4">Upload Content</h3>
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Content Section */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="font-bold text-black mb-4">Your Content</h3>
            <ContentFeed refreshTrigger={refreshTrigger} />
          </div>
        </>
      )}
    </div>
  );

  const renderSupportersSection = () => (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-anton text-black mb-2 tracking-wide">CREATORS YOU SUPPORT</h1>
        <p className="text-gray-600">View the creators you support with your coin holdings</p>
      </div>

      {hasZoraLinked && zoraWallet?.smartWallet ? (
        <>

          {isLoadingCoins && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
              <p className="text-black mt-2">Loading supported creators...</p>
            </div>
          )}
          
          {zoraCoins.length > 0 && zoraCoins.filter(balance => !balance.isOwner).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {zoraCoins.filter(balance => !balance.isOwner).map((balance, index) => (
                <Link key={`supporter-${balance.id || balance.coin?.address || 'unknown'}-${index}`} href={`/creator/${balance.coin?.address}`}>
                  <div className="group bg-white rounded-2xl p-4 border border-gray-200 hover:border-black transition-all duration-300 hover:scale-105 cursor-pointer">
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
                    
                    <div className="bg-gray-50 rounded-lg p-2 text-center border border-gray-200">
                      <div className="text-gray-600">Your Balance</div>
                      <div className="text-black font-bold">
                        {balance.balanceDecimal ? Math.floor(balance.balanceDecimal).toLocaleString() : '0'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !isLoadingCoins && !coinsError ? (
            <div className="text-center py-8">
              <p className="text-black font-bold">No supported creators found.</p>
              <p className="text-gray-600 text-sm mt-2">Purchase creator coins to support your favorite creators!</p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-black font-bold mb-2">Connect your Zora account to see supported creators</p>
          <button
            onClick={linkZora}
            disabled={isLinking}
            className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLinking ? 'Linking...' : 'Link Zora Account'}
          </button>
        </div>
      )}
    </div>
  );

  const renderWalletsSection = () => (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-anton text-black mb-2 tracking-wide">YOUR WALLETS</h1>
        <p className="text-gray-600">Manage your connected wallets and accounts</p>
      </div>

      <div className="space-y-4">
        {/* Primary Wallet */}
        {walletAddress && (
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-black mb-1">Backstage Wallet</h3>
                <p className="text-gray-600 font-mono text-sm break-all">{walletAddress}</p>
              </div>
              <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold flex-shrink-0 self-start sm:self-auto">
                Connected
              </span>
            </div>
          </div>
        )}

        {/* Zora Wallet */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-black mb-1">Zora Wallet</h3>
              {hasZoraLinked && zoraWallet?.smartWallet ? (
                <p className="text-gray-600 font-mono text-sm break-all">{zoraWallet.smartWallet}</p>
              ) : (
                <p className="text-gray-500 text-sm">Not connected</p>
              )}
            </div>
            {hasZoraLinked && zoraWallet?.smartWallet ? (
              <span className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-bold flex-shrink-0 self-start sm:self-auto">
                Connected
              </span>
            ) : (
              <button
                onClick={linkZora}
                disabled={isLinking}
                className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0 self-start sm:self-auto"
              >
                {isLinking ? 'Linking...' : 'Connect'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="flex">
          {/* Left Sidebar Navigation */}
          <div className="hidden md:block w-64 bg-white border-r border-gray-200 fixed top-16 left-0 h-auto flex flex-col">
            <nav className="px-8 py-6">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveSection('creators')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                    activeSection === 'creators'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">Creator</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('supporters')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                    activeSection === 'supporters'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">Supporter</span>
                </button>
                
                <button
                  onClick={() => setActiveSection('wallets')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                    activeSection === 'wallets'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">Wallets</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 pt-16 ml-0 md:ml-64">
            {/* Mobile Navigation Tabs */}
            <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveSection('creators')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeSection === 'creators'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Creator
                </button>
                <button
                  onClick={() => setActiveSection('supporters')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeSection === 'supporters'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Supporter
                </button>
                <button
                  onClick={() => setActiveSection('wallets')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    activeSection === 'wallets'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Wallets
                </button>
              </div>
            </div>
            <main className={`w-full px-4 sm:px-6 lg:px-8 py-8 ${activeSection === 'creators' ? 'pr-4' : 'pr-24'} md:pr-48 lg:pr-64 xl:pr-80`}>
              {activeSection === 'creators' && renderCreatorsSection()}
              {activeSection === 'supporters' && renderSupportersSection()}
              {activeSection === 'wallets' && renderWalletsSection()}
            </main>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}