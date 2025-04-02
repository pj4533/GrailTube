import axios from 'axios';
import { TimeWindow, SearchType } from '@/types';
import { YOUTUBE_API_URL } from './constants';
import { apiStats, handleYouTubeApiError } from './youtubeTypes';
import logger from './logger';

/**
 * Camera filename patterns for unedited videos
 */
export const cameraFilenamePatterns: string[] = [
  'IMG_', 'DSC_', 'DCIM', 'MOV_', 'VID_', 'MVI_'
];

/**
 * Get camera filename patterns for unedited videos with OR operator
 * Using multiple common camera filename patterns to catch more unedited videos
 */
export function getCombinedCameraPatterns(): string {
  return 'IMG_|DSC_|DCIM|MOV_|VID_|MVI_'; // Using OR operator with all available prefixes
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
 * Perform YouTube search API call
 */
export async function performYouTubeSearch(
  apiKey: string,
  searchWindow: TimeWindow,
  searchType: SearchType,
  maxResults: number,
  signal?: AbortSignal
): Promise<string[]> {
  try {
    // Increment API call stats
    apiStats.searchApiCalls++;
    apiStats.totalApiCalls++;
    
    // Get camera filename patterns for search
    const searchQuery = getCombinedCameraPatterns();
    
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