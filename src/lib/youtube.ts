/**
 * Re-export YouTube API functionality from modular files
 * This file exists for backward compatibility
 */

// Re-export everything from the YouTube service
export {
  searchVideosInTimeWindow,
  getVideoDetails,
  filterRareVideos,
  getViewStats
} from './youtubeService';

// Re-export types and error classes
export {
  YouTubeRateLimitError,
  apiStats
} from './youtubeTypes';