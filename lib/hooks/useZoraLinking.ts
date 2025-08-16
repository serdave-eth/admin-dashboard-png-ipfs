'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useCrossAppAccounts } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface ZoraWallet {
  address: string;
  appId: string;
}

export interface UseZoraLinkingReturn {
  linkZora: () => Promise<void>;
  clearZoraLink: () => Promise<void>;
  isLinking: boolean;
  isClearing: boolean;
  error: string | null;
  zoraWallet: ZoraWallet | null;
  hasZoraLinked: boolean;
  clearError: () => void;
}

export const useZoraLinking = (): UseZoraLinkingReturn => {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { linkCrossAppAccount } = useCrossAppAccounts();
  
  const [isLinking, setIsLinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedZoraWallet, setStoredZoraWallet] = useState<string | null>(null);

  // Check if user has Zora account linked
  const zoraAccount = user?.linkedAccounts?.find(
    account => account.type === 'cross_app'
  );

  // Try to get wallet address from different possible sources
  const getZoraWalletAddress = () => {
    if (!zoraAccount) return null;
    
    // Debug: log the zoraAccount structure
    console.log('Zora Account Data:', JSON.stringify(zoraAccount, null, 2));
    
    // Try multiple possible properties where the wallet address might be stored
    const accountData = zoraAccount as any;
    return accountData.address || 
           accountData.walletAddress || 
           accountData.wallet?.address ||
           accountData.linkedAccountId ||
           // If it's from our database, try to extract from subject
           (accountData.subject && accountData.subject.includes('0x') ? 
             accountData.subject.match(/0x[a-fA-F0-9]{40}/)?.[0] : null) ||
           null;
  };

  // Fetch stored Zora wallet from database
  useEffect(() => {
    const fetchStoredZoraWallet = async () => {
      if (!authenticated) return;
      
      try {
        const response = await fetch('/api/user/zora-wallet', {
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStoredZoraWallet(data.data.zoraWallet);
          }
        }
      } catch (error) {
        console.error('Failed to fetch stored Zora wallet:', error);
      }
    };

    fetchStoredZoraWallet();
  }, [authenticated, getAccessToken, user]);

  const zoraWalletAddress = getZoraWalletAddress();
  
  const zoraWallet: ZoraWallet | null = zoraAccount ? {
    // Prefer the stored wallet address from database, fall back to detected address
    address: storedZoraWallet || zoraWalletAddress || 'Zora Account Linked (Address Not Available)',
    appId: process.env.NEXT_PUBLIC_ZORA_APP_ID || 'clpgf04wn04hnkw0fv1m11mnb'
  } : null;

  const hasZoraLinked = Boolean(zoraWallet) || Boolean(zoraAccount);

  const linkZora = useCallback(async () => {
    if (!authenticated) {
      setError('User must be authenticated to link Zora account');
      return;
    }

    if (hasZoraLinked) {
      toast.info('Zora account already linked');
      return;
    }

    setIsLinking(true);
    setError(null);

    try {
      const zoraAppId = process.env.NEXT_PUBLIC_ZORA_APP_ID || 'clpgf04wn04hnkw0fv1m11mnb';
      
      await linkCrossAppAccount({ 
        appId: zoraAppId 
      });

      // Save linking information to database
      const response = await fetch('/api/user/link-zora', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save Zora linking information');
      }

      toast.success('Zora account linked successfully!');
      
      // Refetch the stored wallet data
      const walletResponse = await fetch('/api/user/zora-wallet', {
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });
      
      if (walletResponse.ok) {
        const walletData = await walletResponse.json();
        if (walletData.success && walletData.data) {
          setStoredZoraWallet(walletData.data.zoraWallet);
        }
      }
    } catch (error: unknown) {
      console.error('Zora linking error:', error);
      
      let errorMessage = 'Failed to link Zora account';
      
      if (error instanceof Error) {
        if (error.message?.includes('User denied')) {
          errorMessage = 'Zora linking was cancelled by user';
        } else if (error.message?.includes('not opted-in')) {
          errorMessage = 'Zora has not enabled wallet sharing';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLinking(false);
    }
  }, [authenticated, hasZoraLinked, linkCrossAppAccount, getAccessToken]);

  const clearZoraLink = useCallback(async () => {
    if (!authenticated) {
      setError('User must be authenticated to clear Zora linking');
      return;
    }

    setIsClearing(true);
    setError(null);

    try {
      const response = await fetch('/api/user/clear-zora', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to clear Zora linking');
      }

      toast.success('Zora linking cleared successfully!');
      
      // Clear stored wallet data
      setStoredZoraWallet(null);
      
      // Force a page refresh to clear any cached state
      window.location.reload();
    } catch (error: unknown) {
      console.error('Clear Zora linking error:', error);
      
      let errorMessage = 'Failed to clear Zora linking';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsClearing(false);
    }
  }, [authenticated, getAccessToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    linkZora,
    clearZoraLink,
    isLinking,
    isClearing,
    error,
    zoraWallet,
    hasZoraLinked,
    clearError
  };
};