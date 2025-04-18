import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { YouTubeRateLimitError, apiStats, YouTubeServiceInterface } from './youtubeTypes';
import { filterRareVideos as filterVideos, getViewStats as getVideoStats } from './youtubeFilters';
import { 
  getLargeTimeWindow, 
  performYouTubeSearch 
} from './youtubeSearch';
import { 
  processVideoDetails,
  parseVideoDetails
} from './youtubeVideoDetails';

/**
 * YouTube API Service - Core implementation
 * Encapsulates all YouTube API interactions
 */
class YouTubeApiService implements YouTubeServiceInterface {
  private readonly apiKey: string;
  private readonly maxResultsPerRequest: number;
  private readonly maxIdsPerRequest: number;
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    this.maxResultsPerRequest = 50;
    this.maxIdsPerRequest = 50;
  }
  
  /**
   * Search for videos in a specific time window with a specific search type
   * @param signal Optional AbortSignal to cancel the request
   */
  async searchVideosInTimeWindow(
    window: TimeWindow, 
    searchType: SearchType = SearchType.Unedited, 
    signal?: AbortSignal
  ): Promise<string[]> {
    // Import the founding date
    const { YOUTUBE_FOUNDING_DATE } = require('./constants');
    
    // Always use larger time window for Unedited search
    let searchWindow = getLargeTimeWindow(window);
    
    // Ensure we never search before YouTube's founding
    if (searchWindow.startDate < YOUTUBE_FOUNDING_DATE) {
      searchWindow.startDate = new Date(YOUTUBE_FOUNDING_DATE);
      console.log('Adjusted search window to start at YouTube founding date');
    }
    
    try {
      // Perform the search with no caching
      const videoIds = await performYouTubeSearch(
        this.apiKey, 
        searchWindow, 
        searchType, 
        this.maxResultsPerRequest,
        signal
      );
      
      return videoIds;
    } catch (error) {
      if (error instanceof YouTubeRateLimitError) {
        throw error;
      }
      console.error('Error searching videos:', error);
      return [];
    }
  }
  
  /**
   * Get detailed video information
   * @param signal Optional AbortSignal to cancel the request
   */
  async getVideoDetails(videoIds: string[], signal?: AbortSignal): Promise<Video[]> {
    try {
      // Process video details with batching
      const videoItems = await processVideoDetails(
        this.apiKey,
        videoIds,
        this.maxIdsPerRequest,
        signal
      );
      
      // Parse the videos
      const videos = parseVideoDetails(videoItems);
      
      return videos;
    } catch (error) {
      if (error instanceof YouTubeRateLimitError) {
        throw error;
      }
      
      console.error('Error getting video details:', error);
      return [];
    }
  }
  
  /**
   * Filter videos with less than 10 views
   * Delegates to the filter utility
   */
  filterRareVideos(videos: Video[]): Video[] {
    return filterVideos(videos);
  }
  
  /**
   * Get view statistics from the video collection
   * Delegates to the statistics utility
   */
  getViewStats(videos: Video[]): ViewStats {
    return getVideoStats(videos);
  }
}

// Create a singleton instance of the YouTube API service
const youtubeApiService = new YouTubeApiService();

// Export methods for use elsewhere
export const searchVideosInTimeWindow = (window: TimeWindow, searchType?: SearchType, signal?: AbortSignal): Promise<string[]> => 
  youtubeApiService.searchVideosInTimeWindow(window, searchType, signal);

export const getVideoDetails = (videoIds: string[]): Promise<Video[]> => 
  youtubeApiService.getVideoDetails(videoIds);

export const filterRareVideos = (videos: Video[]): Video[] => 
  filterVideos(videos);

export const getViewStats = (videos: Video[]): ViewStats => 
  getVideoStats(videos);