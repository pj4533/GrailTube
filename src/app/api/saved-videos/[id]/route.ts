import { NextResponse } from 'next/server';
import { VideoModel } from '@/lib/models/videoModel';
import { handleApiError } from '@/lib/api';
import { initDatabase } from '@/lib/db';
import logger from '@/lib/logger';

// Track initialization status
let dbInitialized = false;

// Ensure database is initialized before operations
async function ensureInitialized() {
  logger.debug('API route [id]: Ensuring database is initialized');
  
  try {
    if (!dbInitialized) {
      logger.debug('API route [id]: Initializing database for first time');
      await initDatabase();
      dbInitialized = true;
      logger.debug('API route [id]: Database initialized successfully');
    } else {
      logger.debug('API route [id]: Database already initialized');
      // Verify connection is still active
      await VideoModel.testConnection();
    }
  } catch (error) {
    logger.error('API route [id]: Failed to initialize database', error);
    throw error;
  }
}

/**
 * DELETE /api/saved-videos/[id] - Remove a saved video
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.debug('API route: DELETE /api/saved-videos/[id] called', { id: params.id });
  
  try {
    // Initialize database connection
    await ensureInitialized();
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