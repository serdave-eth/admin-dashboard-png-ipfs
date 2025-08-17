import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyAuthToken } from '@/lib/auth';

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

    const { id: contentId } = await params;

    // Check if content exists and belongs to the authenticated user
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        userWalletAddress: primaryWalletAddress
      }
    });

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the content
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
