import axios from 'axios';
import { Video } from '@/types';
import { YOUTUBE_API_URL } from './constants';
import { apiStats, YouTubeRateLimitError, handleYouTubeApiError } from './youtubeTypes';
import { filterExcludedCategories } from './youtubeFilters';
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
    // Additional information about the video
    const isLiveStream = !!item.liveStreamingDetails;
    const isUpcoming = item.liveStreamingDetails?.scheduledStartTime && 
                     !item.liveStreamingDetails?.actualEndTime;
    const duration = item.contentDetails?.duration || '';
    
    // Check license
    const isLicensed = item.status?.license === 'youtube' ? false : true;
    
    return {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      categoryId: item.snippet.categoryId,
      isLiveStream,
      isUpcoming,
      duration,
      isLicensed
    };
  });
}

/**
 * Process video details including batching, filtering, and caching
 */
export async function processVideoDetails(
  apiKey: string,
  videoIds: string[],
  videoCache: Record<string, Video>,
  maxIdsPerRequest: number,
  signal?: AbortSignal
): Promise<Video[]> {
  if (!videoIds.length) return [];
  
  // Filter out video IDs that are already cached
  const uncachedIds = videoIds.filter(id => !videoCache[id]);
  
  // If all videos are cached, return from cache
  if (uncachedIds.length === 0) {
    apiStats.cachedVideoDetails += videoIds.length;
    return videoIds.map(id => videoCache[id]);
  }
  
  // Split IDs into batches
  const batches = [];
  for (let i = 0; i < uncachedIds.length; i += maxIdsPerRequest) {
    batches.push(uncachedIds.slice(i, i + maxIdsPerRequest));
  }
  
  try {
    // Process all batches in parallel
    const batchPromises = batches.map(batchIds => fetchVideoBatch(apiKey, batchIds, signal));
    const batchResults = await Promise.all(batchPromises);
    const allItems = batchResults.flat();
    
    // Filter out excluded categories
    const filteredItems = filterExcludedCategories(allItems);
    
    // Parse and return video details
    return filteredItems;
  } catch (error) {
    // If this is a rate limit error, propagate it up
    if (error instanceof YouTubeRateLimitError) {
      throw error;
    }
    
    console.error('Error getting video details:', error);
    // Return any cached videos we have for non-rate-limit errors
    return videoIds.map(id => videoCache[id]).filter(Boolean);
  }
}