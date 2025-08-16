'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePrivy, useCrossAppAccounts } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { getProfileBalances } from '@zoralabs/coins-sdk';
import { ethers } from 'ethers';

interface ZoraWallet {
  address: string;
  appId: string;
  smartWallet?: string;
}

interface CoinBalance {
  id: string;
  balance: string;
  balanceDecimal?: number;
  decimals?: number;
  coin?: {
    id?: string;
    name?: string;
    description?: string;
    address?: string;
    symbol?: string;
    totalSupply?: string;
    totalVolume?: string;
    volume24h?: string;
    marketCap?: string;
    marketCapDelta24h?: string;
    uniqueHolders?: number;
    createdAt?: string;
    creatorAddress?: string;
    tokenUri?: string;
    mediaContent?: {
      mimeType?: string;
      originalUri?: string;
      previewImage?: {
        small?: string;
        medium?: string;
        blurhash?: string;
      };
    };
    uniswapV4PoolKey?: {
      token0Address?: string;
      token1Address?: string;
      fee?: number;
      tickSpacing?: number;
      hookAddress?: string;
    };
    uniswapV3PoolAddress?: string;
  };
  isOwner?: boolean;
}

// Contract ABI for the owners function and decimals
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "owners",
    "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export interface UseZoraLinkingReturn {
  linkZora: () => Promise<void>;
  clearZoraLink: () => Promise<void>;
  isLinking: boolean;
  isClearing: boolean;
  error: string | null;
  zoraWallet: ZoraWallet | null;
  hasZoraLinked: boolean;
  clearError: () => void;
  fetchZoraCoins: () => Promise<void>;
  zoraCoins: CoinBalance[];
  isLoadingCoins: boolean;
  coinsError: string | null;
}

export const useZoraLinking = (): UseZoraLinkingReturn => {
  const { user, authenticated, getAccessToken } = usePrivy();
  const { linkCrossAppAccount } = useCrossAppAccounts();
  
  const [isLinking, setIsLinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storedZoraWallet, setStoredZoraWallet] = useState<string | null>(null);
  const [zoraCoins, setZoraCoins] = useState<CoinBalance[]>([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(false);
  const [coinsError, setCoinsError] = useState<string | null>(null);

  // Check if user has Zora account linked
  const zoraAccount = user?.linkedAccounts?.find(
    account => account.type === 'cross_app'
  );

  // Try to get wallet address from different possible sources
  const getZoraWalletAddress = () => {
    if (!zoraAccount) return null;
    
    // Debug: log the zoraAccount structure
    console.log('Zora Account Data:', JSON.stringify(zoraAccount, null, 2));
    console.log('Zora Smart Wallets:', zoraAccount.smartWallets);
    
    // Try multiple possible properties where the wallet address might be stored
    const accountData = zoraAccount as unknown as Record<string, unknown>;
    const wallet = accountData.wallet as Record<string, unknown> | undefined;
    
    return (typeof accountData.address === 'string' ? accountData.address : null) || 
           (typeof accountData.walletAddress === 'string' ? accountData.walletAddress : null) || 
           (wallet && typeof wallet.address === 'string' ? wallet.address : null) ||
           (typeof accountData.linkedAccountId === 'string' ? accountData.linkedAccountId : null) ||
           // If it's from our database, try to extract from subject
           (typeof accountData.subject === 'string' && accountData.subject.includes('0x') ? 
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
    appId: process.env.NEXT_PUBLIC_ZORA_APP_ID || 'clpgf04wn04hnkw0fv1m11mnb',
    smartWallet: zoraAccount.smartWallets?.[0]?.address || undefined
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

  // Check if Zora smart wallet is a creator/owner of a specific coin contract and get decimals
  const checkCoinOwnership = useCallback(async (coinAddress: string, zoraSmartWallet: string): Promise<{isOwner: boolean, decimals: number}> => {
    console.log(`[Ownership Check] Starting check for coin ${coinAddress} with wallet ${zoraSmartWallet}`);
    try {
      // Connect to Base network using LlamaRPC
      const provider = new ethers.JsonRpcProvider('https://base.llamarpc.com');
      
      // Create contract instance
      const contract = new ethers.Contract(coinAddress, CONTRACT_ABI, provider);
      
      // Call the owners function and decimals function
      console.log(`[Ownership Check] Calling contract.owners() and contract.decimals()...`);
      const [owners, decimals] = await Promise.all([
        contract.owners(),
        contract.decimals()
      ]);
      
      console.log(`[Ownership Check] Owners array for ${coinAddress}:`, owners);
      console.log(`[Ownership Check] Checking if ${zoraSmartWallet} is in owners array...`);
      
      // Check if Zora smart wallet is in the owners array
      const isOwner = owners.includes(zoraSmartWallet);
      
      console.log(`[Ownership Check] Result: Coin ${coinAddress}: Zora wallet ${zoraSmartWallet} is owner: ${isOwner}, decimals: ${decimals}`);
      return { isOwner, decimals: Number(decimals) };
    } catch (error) {
      console.error(`[Ownership Check] ERROR - Failed to check ownership for coin ${coinAddress}:`, error);
      console.error(`[Ownership Check] This coin will be excluded due to error. Returning isOwner: false`);
      return { isOwner: false, decimals: 18 }; // Default to 18 decimals on error
    }
  }, []);

  const fetchZoraCoins = useCallback(async () => {
    console.log(`[Zora Coins Debug] ====== STARTING FETCH ZORA COINS ======`);
    console.log(`[Zora Coins Debug] Zora Wallet:`, zoraWallet);
    
    if (!zoraWallet?.smartWallet) {
      console.error(`[Zora Coins Debug] ERROR: No Zora smart wallet available`);
      setCoinsError('No Zora smart wallet available');
      return;
    }

    console.log(`[Zora Coins Debug] Using Smart Wallet: ${zoraWallet.smartWallet}`);
    setIsLoadingCoins(true);
    setCoinsError(null);

    try {
      let allBalances: CoinBalance[] = [];
      let cursor: string | undefined = undefined;
      const pageSize = 20;

      // Continue fetching until no more pages
      do {
        console.log(`[Zora Coins Debug] Fetching page with cursor: ${cursor || 'initial'}`);
        const response = await getProfileBalances({
          identifier: zoraWallet.smartWallet,
          count: pageSize,
          after: cursor,
        });

        const profile = response.data?.profile;
        console.log(`[Zora Coins Debug] Profile response:`, profile);

        // Add balances to our collection
        if (profile && profile.coinBalances?.edges) {
          const balances = profile.coinBalances.edges.map(edge => edge.node);
          console.log(`[Zora Coins Debug] Found ${balances.length} coins on this page`);
          allBalances = [...allBalances, ...balances];
        }

        // Update cursor for next page
        cursor = profile?.coinBalances?.pageInfo?.endCursor;
        const hasNextPage = profile?.coinBalances?.pageInfo?.hasNextPage;
        console.log(`[Zora Coins Debug] Has next page: ${hasNextPage}, Next cursor: ${cursor}`);

        // Break if no more results
        if (!cursor || !hasNextPage) {
          break;
        }

      } while (true);

      // Log total fetched balances before filtering
      console.log(`[Zora Coins Debug] ====== TOTAL FETCHED BALANCES: ${allBalances.length} ======`);
      console.log(`[Zora Coins Debug] All fetched coins:`, allBalances.map(b => ({
        name: b.coin?.name,
        symbol: b.coin?.symbol,
        address: b.coin?.address,
        balance: b.balance
      })));
      
      // Check creator status for all coins and show all coins with balance > 0
      console.log(`[Zora Coins Debug] ====== CHECKING CREATOR STATUS ======`);
      console.log(`[Zora Coins Debug] Processing ${allBalances.length} coins with balances...`);
      
      const processedBalances: CoinBalance[] = [];
      
      for (let i = 0; i < allBalances.length; i++) {
        const balance = allBalances[i];
        console.log(`[Zora Coins Debug] [${i + 1}/${allBalances.length}] Processing coin:`, {
          name: balance.coin?.name,
          symbol: balance.coin?.symbol,
          address: balance.coin?.address,
          balance: balance.balance,
          hasAddress: !!balance.coin?.address
        });
        
        if (balance.coin?.address) {
          console.log(`[Zora Coins Debug] Checking creator status for: ${balance.coin.name || 'Unknown'} (${balance.coin.address})`);
          const { isOwner: isCreator, decimals } = await checkCoinOwnership(balance.coin.address, zoraWallet.smartWallet);
          
          // Convert raw balance to decimal balance
          const rawBalance = BigInt(balance.balance);
          const divisor = BigInt(10 ** decimals);
          const balanceDecimal = Number(rawBalance) / Number(divisor);
          
          if (isCreator) {
            console.log(`[Zora Coins Debug] ✅ CREATOR CONFIRMED for ${balance.coin.name}:`, {
              rawBalance: balance.balance,
              decimals: decimals,
              convertedBalance: balanceDecimal
            });
          } else {
            console.log(`[Zora Coins Debug] 📈 TOKEN HOLDER for ${balance.coin.name}:`, {
              rawBalance: balance.balance,
              decimals: decimals,
              convertedBalance: balanceDecimal
            });
          }
          
          processedBalances.push({
            ...balance,
            isOwner: isCreator, // This indicates if user is the creator
            decimals,
            balanceDecimal
          });
        } else {
          console.log(`[Zora Coins Debug] ⚠️ SKIPPED - No contract address for coin ${i + 1}/${allBalances.length}`);
        }
      }
      
      setZoraCoins(processedBalances);
      console.log(`[Zora Coins Debug] ====== FINAL RESULTS ======`);
      console.log(`[Zora Coins Debug] Showing ${processedBalances.length} coins with balances out of ${allBalances.length} total coins`);
      console.log(`[Zora Coins Debug] Final coins list:`, processedBalances.map(b => ({
        name: b.coin?.name,
        symbol: b.coin?.symbol,
        balance: b.balanceDecimal,
        isCreator: b.isOwner
      })));
    } catch (error: unknown) {
      console.error('Failed to fetch Zora coins:', error);
      let errorMessage = 'Failed to fetch Zora coins';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }
      setCoinsError(errorMessage);
    } finally {
      setIsLoadingCoins(false);
    }
  }, [zoraWallet?.smartWallet, checkCoinOwnership]);

  return {
    linkZora,
    clearZoraLink,
    isLinking,
    isClearing,
    error,
    zoraWallet,
    hasZoraLinked,
    clearError,
    fetchZoraCoins,
    zoraCoins,
    isLoadingCoins,
    coinsError
  };
};