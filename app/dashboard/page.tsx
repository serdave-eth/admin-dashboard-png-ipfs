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
  const { hasZoraLinked } = useZoraLinking();
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
            
            <div className="lg:col-span-2">
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