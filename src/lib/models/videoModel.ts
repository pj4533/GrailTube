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
   * Get total count of saved videos
   */
  async getCount(): Promise<number> {
    logger.debug('VideoModel: Getting count of saved videos');
    
    try {
      const result = await query('SELECT COUNT(*) as total FROM saved_videos');
      
      if (!result || !Array.isArray(result) || result.length === 0) {
        logger.warn('VideoModel: Count query did not return expected result', { result });
        return 0;
      }
      
      return (result[0] as any).total;
    } catch (error) {
      logger.error('VideoModel: Error getting video count', error);
      throw error;
    }
  },

  /**
   * Get saved videos with pagination, ordered by most recently discovered
   * @param page Page number (1-based)
   * @param limit Number of items per page
   */
  async getPaginated(page: number = 1, limit: number = 20): Promise<SavedVideo[]> {
    // Ensure positive values and set defaults
    const pageNumber = Math.max(1, page);
    const pageSize = Math.max(1, limit);
    const offset = (pageNumber - 1) * pageSize;
    
    logger.debug('VideoModel: Getting paginated saved videos', { page: pageNumber, limit: pageSize, offset });
    
    try {
      // Use explicit numbers in the query to avoid prepared statement issues
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
        LIMIT ${pageSize} OFFSET ${offset}
      `);
      
      // Check if we got results
      if (!results || !Array.isArray(results)) {
        logger.warn('VideoModel: getPaginated query did not return an array', { results });
        return [];
      }
      
      logger.debug('VideoModel: Retrieved paginated saved videos', { count: results.length, page: pageNumber, limit: pageSize });
      
      // Convert MySQL datetime strings to ISO format for consistency
      return (results as any[]).map(video => ({
        ...video,
        publishedAt: new Date(video.publishedAt).toISOString(),
        discovered_at: new Date(video.discovered_at).toISOString()
      }));
    } catch (error) {
      logger.error('VideoModel: Error retrieving paginated videos', error);
      throw error;
    }
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