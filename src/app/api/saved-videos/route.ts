import { NextResponse } from 'next/server';
import { initDatabase } from '@/lib/db';
import { VideoModel } from '@/lib/models/videoModel';
import { handleApiError } from '@/lib/api';

// Initialize database on first API call
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

/**
 * GET /api/saved-videos - Retrieve all saved videos
 */
export async function GET() {
  try {
    await ensureInitialized();
    
    const videos = await VideoModel.getAll();
    
    return NextResponse.json({ videos });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'fetching saved videos');
    return NextResponse.json({ error: errorMessage }, { status });
  }
}

/**
 * POST /api/saved-videos - Save a new video
 */
export async function POST(request: Request) {
  try {
    await ensureInitialized();
    
    const data = await request.json();
    const { video } = data;
    
    // Check if video already exists
    const exists = await VideoModel.exists(video.id);
    
    if (exists) {
      return NextResponse.json(
        { error: 'Video already saved' },
        { status: 409 }
      );
    }
    
    // Save the video
    await VideoModel.save(video);
    
    return NextResponse.json({ success: true, message: 'Video saved successfully' });
  } catch (error) {
    const { error: errorMessage, status } = handleApiError(error, 'saving video');
    return NextResponse.json({ error: errorMessage }, { status });
  }
}