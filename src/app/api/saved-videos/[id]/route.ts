import { NextResponse } from 'next/server';
import { VideoModel } from '@/lib/models/videoModel';
import { handleApiError } from '@/lib/api';

/**
 * DELETE /api/saved-videos/[id] - Remove a saved video
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    // Delete the video
    const removed = await VideoModel.remove(videoId);
    
    if (!removed) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Video removed successfully' });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'removing video');
    return NextResponse.json({ error: errorMessage }, { status });
  }
}