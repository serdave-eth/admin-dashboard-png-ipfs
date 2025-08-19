import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

export async function POST(request: NextRequest) {
  try {
    // For unlinking, we just need to verify the token is valid, not extract a wallet
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify the token is valid
    const privyAppSecret = process.env.PRIVY_APP_SECRET?.trim();
    const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();
    
    if (!privyAppId) {
      console.error('NEXT_PUBLIC_PRIVY_APP_ID not configured');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // In production, verify the token properly
    if (privyAppSecret) {
      try {
        const privyClient = new PrivyClient(privyAppId, privyAppSecret);
        const claims = await privyClient.verifyAuthToken(token);
        
        if (!claims || !claims.userId) {
          return NextResponse.json(
            { success: false, error: 'Invalid token' },
            { status: 401 }
          );
        }
      } catch (tokenError: unknown) {
        console.error('Token verification failed:', tokenError);
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } else {
      // Dev mode - just check token structure
      console.log('WARNING: PRIVY_APP_SECRET not configured. Using insecure dev mode for unlink.');
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (!payload.sub) {
          return NextResponse.json(
            { success: false, error: 'Invalid token structure' },
            { status: 401 }
          );
        }
      } catch (parseError: unknown) {
        console.error('Token parsing failed:', parseError);
        return NextResponse.json(
          { success: false, error: 'Invalid token format' },
          { status: 401 }
        );
      }
    }

    // Get the user from the request body
    const body = await request.json();
    const { userId, handle, provider } = body;

    if (!userId || !handle || !provider) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: userId, handle, provider' },
        { status: 400 }
      );
    }

    // Check if we have the app secret for making the unlink API call
    if (!privyAppSecret) {
      console.error('PRIVY_APP_SECRET not configured - cannot make unlink API call');
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing app secret' },
        { status: 500 }
      );
    }

    // Make the unlink request to Privy API - use our app credentials to unlink from Zora
    // The URL should be for our app, and we're unlinking the cross_app account
    const requestBody = {
      user_id: userId,
      type: 'cross_app',
      handle: handle,
      provider: provider
    };
    
    console.log('Unlink request details:', {
      url: `https://auth.privy.io/api/v1/apps/${privyAppId}/users/unlink`,
      appId: privyAppId,
      appSecretLength: privyAppSecret?.length,
      appSecretPrefix: privyAppSecret?.substring(0, 10),
      body: requestBody
    });
    
    const unlinkResponse = await fetch(`https://auth.privy.io/api/v1/apps/${privyAppId}/users/unlink`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${privyAppId}:${privyAppSecret}`).toString('base64')}`,
        'privy-app-id': privyAppId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!unlinkResponse.ok) {
      const errorData = await unlinkResponse.text();
      console.error('Privy unlink error:', unlinkResponse.status, errorData);
      
      return NextResponse.json(
        { success: false, error: `Failed to unlink Zora account: ${unlinkResponse.status}` },
        { status: unlinkResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Zora account unlinked successfully'
    });

  } catch (error) {
    console.error('Unlink Zora error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unlink Zora account' },
      { status: 500 }
    );
  }
}