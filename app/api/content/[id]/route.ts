import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';
import { setCurrentUserWallet } from '@/lib/rls';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const primaryWalletAddress = await verifyAuthToken(request);

    if (!primaryWalletAddress) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Set RLS context for the authenticated user
    await setCurrentUserWallet(prisma, primaryWalletAddress);

    const { id: contentId } = await params;

    // Check if content exists and belongs to the authenticated user
    // RLS policy will automatically filter to user's own content
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        // userWalletAddress filter now handled by RLS policy
        userWalletAddress: primaryWalletAddress
      }
    });

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the content - RLS policy ensures only user's own content can be deleted
    await prisma.content.delete({
      where: {
        id: contentId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
