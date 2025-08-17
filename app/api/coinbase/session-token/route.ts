import { NextRequest, NextResponse } from 'next/server';

// Simplified session token generation for MVP
// In production, use the Coinbase CDP SDK as shown in reference implementation
async function createSessionToken(address: string, amount: string) {
  try {
    console.log('Creating session token for address:', address, 'amount:', amount);
    
    // For MVP, return a mock token
    // In production, implement proper CDP SDK integration
    const mockToken = {
      token: `mock_session_${Date.now()}_${address.slice(0, 8)}`,
      expiresAt: new Date(Date.now() + 120000).toISOString() // 2 minutes
    };
    
    // TODO: Implement actual CDP SDK integration
    // const jwt = await generateJwt({
    //   apiKeyId: process.env.CDP_API_KEY_ID!,
    //   apiKeySecret: process.env.CDP_API_KEY_SECRET!,
    //   ...
    // });
    
    return mockToken;
  } catch (error) {
    console.error('Error creating session token:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, amount } = body;
    
    console.log('Session token API called with:', { address, amount });
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    const result = await createSessionToken(address, amount || '1.00');
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error in session token API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create session token',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}