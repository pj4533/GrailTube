import { NextResponse } from 'next/server';
import { query, initDatabase } from '@/lib/db';

// Initialize database on first API call
let initialized = false;

async function ensureInitialized() {
  if (!initialized) {
    await initDatabase();
    initialized = true;
  }
}

// GET /api/saved-videos - Retrieve all saved videos
export async function GET() {
  try {
    await ensureInitialized();
    
    const results = await query(`
      SELECT 
        id,
        video_id,
        title,
        description,
        thumbnail_url AS thumbnailUrl,
        channel_title AS channelTitle,
        published_at AS publishedAt,
        view_count_at_discovery,
        discovered_at,
        duration
      FROM saved_videos 
      ORDER BY discovered_at DESC
    `);
    
    // Convert MySQL datetime strings to ISO format for consistency
    const videos = (results as any[]).map(video => ({
      ...video,
      publishedAt: new Date(video.publishedAt).toISOString(),
      discovered_at: new Date(video.discovered_at).toISOString()
    }));
    
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching saved videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved videos' },
      { status: 500 }
    );
  }
}

// POST /api/saved-videos - Save a new video
export async function POST(request: Request) {
  try {
    await ensureInitialized();
    
    const data = await request.json();
    const { video } = data;
    
    // Check if video already exists
    const existingVideos = await query(
      'SELECT * FROM saved_videos WHERE video_id = ?',
      [video.id]
    ) as any[];
    
    if (existingVideos.length > 0) {
      return NextResponse.json(
        { error: 'Video already saved' },
        { status: 409 }
      );
    }
    
    // Format the publishedAt date for MySQL
    const publishedAt = new Date(video.publishedAt).toISOString().slice(0, 19).replace('T', ' ');
    
    // Debug the data
    console.log('Saving video with details:', { 
      id: video.id, 
      thumbnailUrl: video.thumbnailUrl,
      viewCount: video.viewCount
    });

    // Ensure the thumbnail URL is using HTTPS
    const thumbnailUrl = video.thumbnailUrl ? video.thumbnailUrl.replace(/^http:/, 'https:') : '';
    
    // Insert the new video
    await query(
      `INSERT INTO saved_videos (
        video_id, title, description, thumbnail_url, 
        channel_title, published_at, view_count_at_discovery, duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        video.id,
        video.title,
        video.description,
        thumbnailUrl,
        video.channelTitle,
        publishedAt,
        video.viewCount || 0,
        video.duration || null
      ]
    );
    
    return NextResponse.json({ success: true, message: 'Video saved successfully' });
  } catch (error) {
    console.error('Error saving video:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 }
    );
  }
}