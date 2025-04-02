import axios from 'axios';
import { TimeWindow, SearchType } from '@/types';
import { YOUTUBE_API_URL } from './constants';
import { apiStats, handleYouTubeApiError } from './youtubeTypes';
import logger from './logger';

/**
 * Search terms and patterns for different search types
 */
export const searchTerms: string[] = [
  'random', 'interesting', 'cool', 'fun', 'amazing', 
  'wow', 'look', 'check', 'see', 'watch', 'observe',
  'nature', 'outdoor', 'adventure', 'daily', 'life',
  'hobby', 'craft', 'diy', 'homemade', 'amateur',
  'family', 'kids', 'pet', 'dog', 'cat', 'animal',
  'travel', 'trip', 'journey', 'vacation', 'holiday',
  'food', 'cooking', 'recipe', 'baking', 'meal',
  'game', 'play', 'fun', 'adventure', 'explore'
];

export const cameraFilenamePatterns: string[] = [
  'IMG_', 'DSC_', 'DCIM', 'MOV_', 'VID_', 'MVI_',
  'GOPRO', 'CLIP', 'REC', 'VIDEO', 'CAMERA',
  'iphone', 'samsung', 'pixel', 'P_', 'PANA', 'LUMIX',
  'canon', 'nikon', 'sony', 'fuji', 'olympus', 'raw footage'
];

/**
 * Get a random search term to diversify results
 */
export function getRandomSearchTerm(): string {
  const randomIndex = Math.floor(Math.random() * searchTerms.length);
  return searchTerms[randomIndex];
}

/**
 * Get combined camera filename patterns for unedited videos using OR operators
 */
export function getCombinedCameraPatterns(): string {
  return cameraFilenamePatterns.join('|');
}

/**
 * Get search query based on search type
 */
export function getSearchQuery(searchType: SearchType, userKeyword?: string): string {
  switch (searchType) {
    case SearchType.RandomTime:
      return getRandomSearchTerm();
    case SearchType.Unedited:
      return getCombinedCameraPatterns();
    case SearchType.Keyword:
      return userKeyword || getRandomSearchTerm(); // Use provided keyword or fall back to random
    default:
      return getRandomSearchTerm();
  }
}

/**
 * Create a larger time window for unedited content
 */
export function getLargeTimeWindow(baseWindow: TimeWindow): TimeWindow {
  // For unedited content, we want a larger window (2x the original)
  const centerTime = new Date((baseWindow.startDate.getTime() + baseWindow.endDate.getTime()) / 2);
  const largeDuration = baseWindow.durationMinutes * 2;
  
  const halfDuration = largeDuration / 2;
  const startDate = new Date(centerTime.getTime() - (halfDuration * 60 * 1000));
  const endDate = new Date(centerTime.getTime() + (halfDuration * 60 * 1000));
  
  return {
    startDate,
    endDate,
    durationMinutes: largeDuration
  };
}

/**
 * Generate cache key for a time window and search type
 */
export function getSearchCacheKey(window: TimeWindow, searchType: SearchType): string {
  return `${searchType}_${window.startDate.toISOString()}_${window.endDate.toISOString()}`;
}

/**
 * Perform YouTube search API call
 */
export async function performYouTubeSearch(
  apiKey: string,
  searchWindow: TimeWindow,
  searchType: SearchType,
  maxResults: number,
  userKeyword?: string,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    // Increment API call stats
    apiStats.searchApiCalls++;
    apiStats.totalApiCalls++;
    
    // Get search query based on search type
    const searchQuery = getSearchQuery(searchType, userKeyword);
    
    // Log the search request
    logger.info('Performing YouTube search', {
      searchType,
      searchQuery,
      timeWindow: {
        startDate: searchWindow.startDate.toISOString(),
        endDate: searchWindow.endDate.toISOString(),
        durationMinutes: searchWindow.durationMinutes
      }
    });
    
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: maxResults,
        type: 'video',
        publishedAfter: searchWindow.startDate.toISOString(),
        publishedBefore: searchWindow.endDate.toISOString(),
        q: searchQuery,
        key: apiKey,
      },
      signal, // Add the abort signal
    });
    
    logger.debug('YouTube search completed', {
      searchType,
      searchQuery,
      resultsCount: response.data.items.length
    });
    
    return response.data.items.map((item: any) => item.id.videoId);
  } catch (error) {
    logger.error('YouTube search failed', { searchType, error });
    return handleYouTubeApiError(error, 'video search');
  }
}