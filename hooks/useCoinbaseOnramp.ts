import { useState, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface OnrampOptions {
  requiredAmount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useCoinbaseOnramp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = usePrivy();
  
  const initiateOnramp = useCallback(async ({ requiredAmount, onSuccess, onCancel }: OnrampOptions) => {
    // Get user's wallet address
    const walletAddress = user?.wallet?.address || 
      user?.linkedAccounts?.find(account => account.type === 'wallet')?.address;
    
    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating session token for Onramp...');
      
      // Create session token for Coinbase Onramp
      const response = await fetch('/api/coinbase/session-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address: walletAddress, 
          amount: requiredAmount.toFixed(2)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session token');
      }

      const sessionData = await response.json();
      console.log('Session token created successfully');

      // Store success callback in session storage for after redirect
      if (onSuccess) {
        sessionStorage.setItem('onramp_callback', 'pending');
      }

      // Construct Coinbase Onramp URL with session token
      const onrampParams = new URLSearchParams({
        sessionToken: sessionData.token,
        destinationWallets: JSON.stringify([{
          address: walletAddress,
          blockchains: ['base'],
          assets: ['USDC']
        }]),
        defaultAsset: 'USDC',
        defaultNetwork: 'base',
        presetFiatAmount: Math.ceil(requiredAmount + 1).toString(), // Add buffer for fees
        defaultPaymentMethod: 'card',
        handoffUrl: window.location.origin + '/api/coinbase/complete',
      });

      const onrampUrl = `https://pay.coinbase.com/buy/select-asset?${onrampParams.toString()}`;
      
      console.log('Redirecting to Coinbase Onramp');
      
      // Open in new window or redirect
      const onrampWindow = window.open(onrampUrl, '_blank', 'width=420,height=700');
      
      // Check if window was closed
      if (onrampWindow) {
        const checkInterval = setInterval(() => {
          if (onrampWindow.closed) {
            clearInterval(checkInterval);
            setLoading(false);
            
            // Check if onramp was successful
            const wasSuccessful = sessionStorage.getItem('onramp_success');
            if (wasSuccessful === 'true') {
              sessionStorage.removeItem('onramp_success');
              onSuccess?.();
            } else {
              onCancel?.();
            }
          }
        }, 1000);
      }

    } catch (err: any) {
      console.error('Onramp error:', err);
      setError(err.message || 'Failed to initialize Onramp');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    initiateOnramp,
    loading,
    error,
    resetError
  };
}