import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Bypass RLS to see all content in database
    await prisma.$executeRaw`SET row_security = off`;
    
    const allContent = await prisma.content.findMany({
      take: 10,
      orderBy: {
        created_at: 'desc',
      },
    });
    
    // Re-enable RLS
    await prisma.$executeRaw`SET row_security = on`;
    
    return NextResponse.json({
      success: true,
      count: allContent.length,
      items: allContent.map(item => ({
        id: item.id,
        user_wallet_address: item.user_wallet_address,
        filename: item.filename,
        file_type: item.file_type,
        fileSize: item.file_size.toString(),
        ipfs_cid: item.ipfs_cid,
        created_at: item.created_at,
        coin_contract_address: item.coin_contract_address,
        minimum_token_amount: item.minimum_token_amount,
      })),
    });
  } catch (error) {
    console.error('Debug content fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch content', details: String(error) },
      { status: 500 }
    );
  }
}