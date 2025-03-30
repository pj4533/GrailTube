import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// DELETE /api/saved-videos/[id] - Remove a saved video
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id;
    
    // Delete the video
    const result = await query(
      'DELETE FROM saved_videos WHERE video_id = ?',
      [videoId]
    ) as any;
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Video removed successfully' });
  } catch (error) {
    console.error('Error removing video:', error);
    return NextResponse.json(
      { error: 'Failed to remove video' },
      { status: 500 }
    );
  }
}