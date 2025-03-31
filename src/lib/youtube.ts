/**
 * Re-export YouTube API functionality from modular files
 * This file exists for backward compatibility
 */

// Import what we need from youtubeService
import { 
  searchVideosInTimeWindow as search,
  getVideoDetails as getDetails,
  filterRareVideos as filter,
  getViewStats as stats
} from './youtubeService';

// Import from types
import { 
  YouTubeRateLimitError as RateLimitError,
  apiStats as stats2,
  YouTubeServiceInterface
} from './youtubeTypes';

import { TimeWindow, SearchType } from '@/types';
import { Video, ViewStats } from '@/types';

// Re-export with updated signatures
export const searchVideosInTimeWindow = (
  window: TimeWindow, 
  searchType?: SearchType
): Promise<string[]> => search(window, searchType);

export const getVideoDetails = (videoIds: string[]): Promise<Video[]> => getDetails(videoIds);
export const filterRareVideos = filter;
export const getViewStats = stats;
export const apiStats = stats2;
export const YouTubeRateLimitError = RateLimitError;