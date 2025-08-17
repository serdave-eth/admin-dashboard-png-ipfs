import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // This endpoint is called when user returns from Coinbase Onramp
  console.log('Coinbase onramp completion callback');
  
  // In a real implementation, you would:
  // 1. Verify the onramp was successful
  // 2. Check the user's new USDC balance
  // 3. Update any necessary state
  
  // For now, redirect back to the creator page with a success flag
  const redirectUrl = new URL('/creator', request.url);
  redirectUrl.searchParams.set('onramp', 'success');
  
  // Set a flag in cookies/storage to indicate success
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set('onramp_success', 'true', { 
    maxAge: 60, // 1 minute
    httpOnly: false 
  });
  
  return response;
}