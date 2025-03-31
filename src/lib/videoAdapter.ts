import { Video, SavedVideo } from '@/types';

/**
 * Adapts a SavedVideo to the Video interface format
 * This centralized conversion ensures consistency across the app
 */
export function adaptSavedVideoToVideo(savedVideo: SavedVideo): Video {
  return {
    id: savedVideo.video_id,
    title: savedVideo.title,
    description: savedVideo.description,
    thumbnailUrl: savedVideo.thumbnailUrl,
    publishedAt: savedVideo.publishedAt,
    // Use view count at discovery for saved videos
    viewCount: savedVideo.view_count_at_discovery || 0,
    channelTitle: savedVideo.channelTitle,
    channelId: savedVideo.channelId,
    duration: savedVideo.duration,
  };
}

/**
 * Check if a video object is a SavedVideo
 */
export function isSavedVideo(video: Video | SavedVideo): video is SavedVideo {
  return 'video_id' in video;
}

/**
 * Prepares a video for saving to the database
 * Handles data transformation and validation
 */
export function prepareVideoForSaving(video: Video): {
  video_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  channel_id: string | null;
  published_at: string;
  view_count_at_discovery: number;
  duration: string | null;
} {
  // Format the publishedAt date for MySQL
  const publishedAt = new Date(video.publishedAt).toISOString().slice(0, 19).replace('T', ' ');
  
  // Ensure the thumbnail URL is using HTTPS
  const thumbnailUrl = video.thumbnailUrl ? video.thumbnailUrl.replace(/^http:/, 'https:') : '';
  
  return {
    video_id: video.id,
    title: video.title,
    description: video.description,
    thumbnail_url: thumbnailUrl,
    channel_title: video.channelTitle,
    channel_id: video.channelId || null,
    published_at: publishedAt,
    view_count_at_discovery: video.viewCount || 0,
    duration: video.duration || null
  };
}