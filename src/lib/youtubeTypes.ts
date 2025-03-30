import { Video, TimeWindow, ViewStats } from '@/types';

/**
 * Error type for YouTube API rate limits
 */
export class YouTubeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeRateLimitError';
  }
}

/**
 * API call stats for monitoring YouTube API usage
 */
export const apiStats = {
  searchApiCalls: 0,
  videoDetailApiCalls: 0,
  totalApiCalls: 0,
  cachedSearches: 0,
  cachedVideoDetails: 0,
  reset: () => {
    apiStats.searchApiCalls = 0;
    apiStats.videoDetailApiCalls = 0;
    apiStats.totalApiCalls = 0;
    apiStats.cachedSearches = 0;
    apiStats.cachedVideoDetails = 0;
  }
};

/**
 * Interface for the YouTube API service
 */
export interface YouTubeServiceInterface {
  searchVideosInTimeWindow(window: TimeWindow): Promise<string[]>;
  getVideoDetails(videoIds: string[]): Promise<Video[]>;
  filterRareVideos(videos: Video[]): Video[];
  getViewStats(videos: Video[]): ViewStats;
}