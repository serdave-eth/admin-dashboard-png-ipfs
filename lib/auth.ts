import { PrivyClient } from '@privy-io/server-auth';
import { NextRequest } from 'next/server';

// Initialize Privy client for server-side auth
const privyClient = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

export async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No Bearer token found in Authorization header');
      return null;
    }

    const token = authHeader.substring(7).trim();
    
    if (!token) {
      console.error('Empty token provided');
      return null;
    }

    // Check if app secret is configured for production security
    const appSecret = process.env.PRIVY_APP_SECRET;
    if (!appSecret || appSecret.includes('your_privy_app_secret_here')) {
      console.warn('WARNING: PRIVY_APP_SECRET not configured. Using insecure dev mode.');
      
      // Development mode - decode without verification (INSECURE)
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error('Invalid JWT format in dev mode');
          return null;
        }
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('Dev mode - Token payload:', JSON.stringify(payload, null, 2));
        
        // Extract wallet address from various possible locations in token
        const walletAddress = 
          payload.wallet?.address ||
          payload.linkedAccounts?.find((acc: { type: string; address?: string }) => 
            acc.type === 'wallet' && acc.address
          )?.address ||
          payload.sub ||
          payload.userId;
          
        if (!walletAddress) {
          console.error('No wallet address found in dev mode token payload');
          return null;
        }
        
        console.log('Dev mode - Extracted wallet address:', walletAddress);
        return walletAddress;
      } catch (e) {
        console.error('Failed to decode token in dev mode:', e);
        return null;
      }
    }

    // Production mode - verify with Privy using app secret
    console.log('Production mode - Verifying token with Privy');
    
    try {
      const claims = await privyClient.verifyAuthToken(token);
      console.log('Token verified successfully. Claims:', claims);
      
      // Extract wallet address from verified claims
      // Privy's AuthTokenClaims typically has userId property
      const walletAddress = claims.userId;
      
      // If userId doesn't look like a wallet address, it might be a Privy user ID
      if (walletAddress && !walletAddress.startsWith('0x')) {
        // This might be a Privy user ID, not a wallet address
        // In this case, we may need to make an additional call to get user data
        console.warn('Token contains Privy user ID, not wallet address. May need additional user lookup.');
        
        // For production use, you might want to make an additional API call to Privy
        // to get the user's linked wallets using the user ID
        // For now, we'll return null to maintain security
        return null;
      }
      
      if (!walletAddress || !walletAddress.startsWith('0x')) {
        console.error('No valid wallet address found in verified token claims');
        return null;
      }
      
      console.log('Production mode - Extracted wallet address:', walletAddress);
      return walletAddress;
      
    } catch (privyError: unknown) {
      const error = privyError as { message?: string; status?: number; code?: string };
      console.error('Privy token verification failed:', {
        message: error.message,
        status: error.status,
        code: error.code
      });
      return null;
    }
    
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string };
    console.error('Token verification error:', {
      message: err.message,
      stack: err.stack
    });
    return null;
  }
}