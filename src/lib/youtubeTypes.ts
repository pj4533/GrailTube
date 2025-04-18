import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import axios, { AxiosError } from 'axios';

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
 * YouTube service-specific error handler
 * This is a separate implementation from the API error handler
 */
export function handleYouTubeApiError(error: any, context: string): never | [] {
  // Check for cancellation
  if (axios.isCancel(error)) {
    console.log('Request cancelled:', context);
    return [];
  }
  
  console.error(`Error during ${context}:`, error);
  
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    // Check for rate limiting
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      // Direct quota/rate limit errors
      if (status === 403 && data?.error?.errors?.some((e: any) => 
          e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded')) {
        throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
      }
      
      // Other rate limiting responses
      if (status === 429 || status === 403) {
        throw new YouTubeRateLimitError('YouTube API rate limit reached. Please try again later.');
      }
    }
  }
  
  // For other errors, return empty array
  return [];
}

/**
 * API call stats for monitoring YouTube API usage
 */
export const apiStats = {
  searchApiCalls: 0,
  videoDetailApiCalls: 0,
  totalApiCalls: 0,
  reset: () => {
    apiStats.searchApiCalls = 0;
    apiStats.videoDetailApiCalls = 0;
    apiStats.totalApiCalls = 0;
  }
};

/**
 * Interface for the YouTube API service
 */
export interface YouTubeServiceInterface {
  setApiKey(key: string): void;
  searchVideosInTimeWindow(window: TimeWindow, searchType?: SearchType, signal?: AbortSignal): Promise<string[]>;
  getVideoDetails(videoIds: string[], signal?: AbortSignal): Promise<Video[]>;
  filterRareVideos(videos: Video[]): Video[];
  getViewStats(videos: Video[]): ViewStats;
}