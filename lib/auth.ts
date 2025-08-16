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
      console.error('No Bearer token found');
      return null;
    }

    const token = authHeader.substring(7).trim();
    
    // For development, if no app secret is configured, 
    // extract wallet address from token payload (NOT SECURE - dev only)
    if (!process.env.PRIVY_APP_SECRET) {
      console.warn('WARNING: PRIVY_APP_SECRET not configured. Using insecure dev mode.');
      try {
        // Decode JWT payload without verification (dev only)
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        
        // Try to find wallet address in various possible locations
        const walletAddress = 
          payload.wallet?.address ||
          payload.linkedAccounts?.find((acc: any) => acc.type === 'wallet')?.address ||
          payload.sub; // Sometimes the wallet address is the subject
          
        return walletAddress || null;
      } catch (e) {
        console.error('Failed to decode token:', e);
        return null;
      }
    }

    // Production mode - verify with Privy
    const claims = await privyClient.verifyAuthToken(token);
    
    // Extract wallet address from verified claims
    const walletAddress = 
      claims.wallet?.address ||
      claims.linkedAccounts?.find((acc: any) => acc.type === 'wallet')?.address ||
      claims.userId; // Fallback to userId if no wallet
      
    return walletAddress || null;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}