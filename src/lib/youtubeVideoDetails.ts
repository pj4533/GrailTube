import axios from 'axios';
import { Video } from '@/types';
import { YOUTUBE_API_URL } from './constants';
import { apiStats, YouTubeRateLimitError, handleYouTubeApiError } from './youtubeTypes';
import logger from './logger';

/**
 * Fetch a batch of video details from YouTube API
 */
export async function fetchVideoBatch(apiKey: string, batchIds: string[], signal?: AbortSignal): Promise<any[]> {
  try {
    // Increment API call stats
    apiStats.videoDetailApiCalls++;
    apiStats.totalApiCalls++;
    
    logger.info('Fetching YouTube video details', {
      batchSize: batchIds.length,
      batchIds
    });
    
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails,liveStreamingDetails,topicDetails,status',
        id: batchIds.join(','),
        key: apiKey,
      },
      signal
    });
    
    logger.debug('YouTube video details fetched', {
      requestedIds: batchIds.length,
      receivedItems: response.data.items?.length || 0
    });
    
    return response.data.items || [];
  } catch (error) {
    logger.error('Failed to fetch YouTube video details', { error });
    return handleYouTubeApiError(error, 'fetching video details');
  }
}

/**
 * Parse YouTube API response into Video objects
 */
export function parseVideoDetails(items: any[]): Video[] {
  return items.map(item => {
    // Duration information
    const duration = item.contentDetails?.duration || '';
    
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      duration
    };
  });
}

/**
 * Process video details including batching and filtering
 */
export async function processVideoDetails(
  apiKey: string,
  videoIds: string[],
  maxIdsPerRequest: number,
  signal?: AbortSignal
): Promise<Video[]> {
  if (!videoIds.length) return [];
  
  // Split IDs into batches
  const batches = [];
  for (let i = 0; i < videoIds.length; i += maxIdsPerRequest) {
    batches.push(videoIds.slice(i, i + maxIdsPerRequest));
  }
  
  try {
    // Process all batches in parallel
    const batchPromises = batches.map(batchIds => fetchVideoBatch(apiKey, batchIds, signal));
    const batchResults = await Promise.all(batchPromises);
    const allItems = batchResults.flat();
    
    // Return video details
    return allItems;
  } catch (error) {
    // If this is a rate limit error, propagate it up
    if (error instanceof YouTubeRateLimitError) {
      throw error;
    }
    
    console.error('Error getting video details:', error);
    return [];
  }
}