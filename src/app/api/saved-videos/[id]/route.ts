import { NextResponse } from 'next/server';
import { VideoModel } from '@/lib/models/videoModel';
import { handleApiError } from '@/lib/api';
import { initDatabase } from '@/lib/db';
import { cookies } from 'next/headers';
import { ADMIN_TOKEN_COOKIE } from '@/lib/constants';
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
 * Verify admin authentication status
 */
function isAuthenticated(): boolean {
  const adminToken = cookies().get(ADMIN_TOKEN_COOKIE);
  return !!adminToken?.value;
}

/**
 * DELETE /api/saved-videos/[id] - Remove a saved video
 * Requires admin authentication
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  logger.debug('API route: DELETE /api/saved-videos/[id] called', { id: params.id });
  
  try {
    // Check admin authentication
    if (!isAuthenticated()) {
      logger.warn('Unauthorized attempt to delete video', { id: params.id });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
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

// Make this route dynamic to avoid static generation errors
export const dynamic = 'force-dynamic';