import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { YouTubeRateLimitError, apiStats, YouTubeServiceInterface } from './youtubeTypes';
import { filterRareVideos as filterVideos, getViewStats as getVideoStats } from './youtubeFilters';
import { 
  getLargeTimeWindow, 
  getSearchCacheKey, 
  performYouTubeSearch 
} from './youtubeSearch';
import { 
  processVideoDetails,
  parseVideoDetails
} from './youtubeVideoDetails';

/**
 * YouTube API Service - Core implementation
 * Encapsulates all YouTube API interactions with caching
 */
class YouTubeApiService implements YouTubeServiceInterface {
  private readonly apiKey: string;
  private readonly maxResultsPerRequest: number;
  private readonly maxIdsPerRequest: number;
  
  // Simple in-memory cache
  private videoCache: Record<string, Video> = {};
  private searchCache: Record<string, string[]> = {};
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    this.maxResultsPerRequest = 50;
    this.maxIdsPerRequest = 50;
  }
  
  /**
   * Search for videos in a specific time window with a specific search type
   */
  async searchVideosInTimeWindow(window: TimeWindow, searchType: SearchType = SearchType.RandomTime): Promise<string[]> {
    // Import the founding date
    const { YOUTUBE_FOUNDING_DATE } = require('./constants');
    
    // Determine the appropriate time window based on search type
    let searchWindow = {...window};
    if (searchType === SearchType.Unedited) {
      searchWindow = getLargeTimeWindow(window);
    }
    
    // Ensure we never search before YouTube's founding
    if (searchWindow.startDate < YOUTUBE_FOUNDING_DATE) {
      searchWindow.startDate = new Date(YOUTUBE_FOUNDING_DATE);
      console.log('Adjusted search window to start at YouTube founding date');
    }
    
    const cacheKey = getSearchCacheKey(searchWindow, searchType);
    
    // Check if we already have this search cached
    if (this.searchCache[cacheKey]) {
      console.log(`Using cached search results for ${cacheKey}`);
      apiStats.cachedSearches++;
      return this.searchCache[cacheKey];
    }
    
    try {
      // Perform the search
      const videoIds = await performYouTubeSearch(
        this.apiKey, 
        searchWindow, 
        searchType, 
        this.maxResultsPerRequest
      );
      
      // Cache the results
      this.searchCache[cacheKey] = videoIds;
      
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
   */
  async getVideoDetails(videoIds: string[]): Promise<Video[]> {
    try {
      // Process video details with batching and caching
      const videoItems = await processVideoDetails(
        this.apiKey,
        videoIds,
        this.videoCache,
        this.maxIdsPerRequest
      );
      
      // Parse and cache the videos
      const videos = parseVideoDetails(videoItems);
      
      // Update cache with new videos
      videos.forEach(video => {
        this.videoCache[video.id] = video;
      });
      
      // Return all videos (including previously cached ones)
      return videoIds.map(id => this.videoCache[id]).filter(Boolean);
    } catch (error) {
      if (error instanceof YouTubeRateLimitError) {
        throw error;
      }
      
      console.error('Error getting video details:', error);
      // Return any cached videos we have for non-rate-limit errors
      return videoIds.map(id => this.videoCache[id]).filter(Boolean);
    }
  }
  
  /**
   * Filter videos with less than 10 views and not streams or commercial content
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
export const searchVideosInTimeWindow = (window: TimeWindow, searchType?: SearchType): Promise<string[]> => 
  youtubeApiService.searchVideosInTimeWindow(window, searchType);

export const getVideoDetails = (videoIds: string[]): Promise<Video[]> => 
  youtubeApiService.getVideoDetails(videoIds);

export const filterRareVideos = (videos: Video[]): Video[] => 
  filterVideos(videos);

export const getViewStats = (videos: Video[]): ViewStats => 
  getVideoStats(videos);