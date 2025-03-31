import { query } from '@/lib/db';
import { Video, SavedVideo } from '@/types';
import { prepareVideoForSaving } from '@/lib/videoAdapter';
import logger from '@/lib/logger';

/**
 * Video model that provides data access functions for the saved_videos table
 */
export const VideoModel = {
  /**
   * Tests the database connection by doing a simple lightweight query
   */
  async testConnection(): Promise<boolean> {
    logger.debug('VideoModel: Testing database connection');
    try {
      // Simple lightweight query to check connection
      await query('SELECT 1 AS connection_test');
      logger.debug('VideoModel: Database connection test passed');
      return true;
    } catch (error) {
      logger.error('VideoModel: Database connection test failed', error);
      throw error;
    }
  },
  /**
   * Get all saved videos, ordered by most recently discovered
   */
  async getAll(): Promise<SavedVideo[]> {
    logger.debug('VideoModel: Getting all saved videos');
    
    try {
      const results = await query(`
        SELECT 
          id,
          video_id,
          title,
          description,
          thumbnail_url AS thumbnailUrl,
          channel_title AS channelTitle,
          channel_id AS channelId,
          published_at AS publishedAt,
          view_count_at_discovery,
          discovered_at,
          duration
        FROM saved_videos 
        ORDER BY discovered_at DESC
      `);
      
      // Check if we got results
      if (!results || !Array.isArray(results)) {
        logger.warn('VideoModel: getAll query did not return an array', { results });
        return [];
      }
      
      logger.debug('VideoModel: Retrieved saved videos', { count: results.length });
      
      // Convert MySQL datetime strings to ISO format for consistency
      return (results as any[]).map(video => ({
        ...video,
        publishedAt: new Date(video.publishedAt).toISOString(),
        discovered_at: new Date(video.discovered_at).toISOString()
      }));
    } catch (error) {
      logger.error('VideoModel: Error retrieving all videos', error);
      throw error;
    }
  },
  
  /**
   * Find a video by its YouTube ID
   */
  async findById(videoId: string): Promise<SavedVideo | null> {
    const results = await query(
      `SELECT 
        id,
        video_id,
        title,
        description,
        thumbnail_url AS thumbnailUrl,
        channel_title AS channelTitle,
        channel_id AS channelId,
        published_at AS publishedAt,
        view_count_at_discovery,
        discovered_at,
        duration
      FROM saved_videos 
      WHERE video_id = ?`,
      [videoId]
    ) as any[];
    
    if (results.length === 0) {
      return null;
    }
    
    const video = results[0];
    
    // Convert dates to ISO strings
    return {
      ...video,
      publishedAt: new Date(video.publishedAt).toISOString(),
      discovered_at: new Date(video.discovered_at).toISOString()
    };
  },
  
  /**
   * Save a new video to the database
   */
  async save(video: Video): Promise<void> {
    const videoData = prepareVideoForSaving(video);
    
    await query(
      `INSERT INTO saved_videos (
        video_id, title, description, thumbnail_url, 
        channel_title, channel_id, published_at, view_count_at_discovery, duration
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        videoData.video_id,
        videoData.title,
        videoData.description,
        videoData.thumbnail_url,
        videoData.channel_title,
        videoData.channel_id,
        videoData.published_at,
        videoData.view_count_at_discovery,
        videoData.duration
      ]
    );
  },
  
  /**
   * Remove a video by its YouTube ID
   */
  async remove(videoId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM saved_videos WHERE video_id = ?',
      [videoId]
    ) as any;
    
    // Return true if a row was affected (deleted)
    return result.affectedRows > 0;
  },
  
  /**
   * Check if a video exists by its YouTube ID
   */
  async exists(videoId: string): Promise<boolean> {
    const results = await query(
      'SELECT 1 FROM saved_videos WHERE video_id = ? LIMIT 1',
      [videoId]
    ) as any[];
    
    return results.length > 0;
  }
};