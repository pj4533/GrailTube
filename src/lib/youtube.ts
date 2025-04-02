/**
 * Re-export YouTube API functionality from modular files
 * Central API facade for all YouTube-related functionality
 */

// Import from service
import { 
  searchVideosInTimeWindow as searchImpl,
  getVideoDetails as details,
  filterRareVideos as filter,
  getViewStats as stats
} from './youtubeService';

// Import from types
import { 
  YouTubeRateLimitError as RateLimitError,
  apiStats as statsObject,
  YouTubeServiceInterface
} from './youtubeTypes';

import { TimeWindow, SearchType } from '@/types';

// Re-export everything with consistent naming, with explicit function signatures
export const searchVideosInTimeWindow = (window: TimeWindow, searchType?: SearchType, signal?: AbortSignal): Promise<string[]> => {
  return searchImpl(window, searchType, signal);
};
export const getVideoDetails = details;
export const filterRareVideos = filter;
export const getViewStats = stats;
export const apiStats = statsObject;
export const YouTubeRateLimitError = RateLimitError;