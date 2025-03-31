import axios, { AxiosError } from 'axios';
import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { YOUTUBE_API_URL } from './constants';
import { YouTubeRateLimitError, apiStats, YouTubeServiceInterface } from './youtubeTypes';
import { filterRareVideos as filterVideos, filterExcludedCategories, getViewStats as getVideoStats } from './youtubeFilters';

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
  
  // Random search terms to diversify results and avoid commercial content
  private readonly searchTerms: string[] = [
    'random', 'interesting', 'cool', 'fun', 'amazing', 
    'wow', 'look', 'check', 'see', 'watch', 'observe',
    'nature', 'outdoor', 'adventure', 'daily', 'life',
    'hobby', 'craft', 'diy', 'homemade', 'amateur',
    'family', 'kids', 'pet', 'dog', 'cat', 'animal',
    'travel', 'trip', 'journey', 'vacation', 'holiday',
    'food', 'cooking', 'recipe', 'baking', 'meal',
    'game', 'play', 'fun', 'adventure', 'explore'
  ];
  
  // Camera filename patterns for "Unedited" search type
  private readonly cameraFilenamePatterns: string[] = [
    'IMG_', 'DSC_', 'DCIM', 'MOV_', 'VID_', 'MVI_',
    'GOPRO', 'CLIP', 'REC', 'VIDEO', 'CAMERA',
    'iphone', 'samsung', 'pixel', 'P_', 'PANA', 'LUMIX',
    'canon', 'nikon', 'sony', 'fuji', 'olympus', 'raw footage'
  ];
  
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    this.maxResultsPerRequest = 50;
    this.maxIdsPerRequest = 50;
  }
  
  /**
   * Get a random search term to diversify results
   */
  private getRandomSearchTerm(): string {
    const randomIndex = Math.floor(Math.random() * this.searchTerms.length);
    return this.searchTerms[randomIndex];
  }
  
  /**
   * Get a random camera filename pattern for unedited videos
   */
  private getRandomCameraPattern(): string {
    const randomIndex = Math.floor(Math.random() * this.cameraFilenamePatterns.length);
    return this.cameraFilenamePatterns[randomIndex];
  }
  
  /**
   * Get search query based on search type
   */
  private getSearchQuery(searchType: SearchType): string {
    switch (searchType) {
      case SearchType.RandomTime:
        return this.getRandomSearchTerm();
      case SearchType.Unedited:
        return this.getRandomCameraPattern();
      default:
        return this.getRandomSearchTerm();
    }
  }
  
  /**
   * Create a larger time window for unedited content
   */
  private getLargeTimeWindow(baseWindow: TimeWindow): TimeWindow {
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
   * Check if the API error is a rate limit error
   */
  private isRateLimitError(error: AxiosError): boolean {
    if (!error.response || !error.response.data) return false;
    
    const errorDetails = error.response.data as any;
    const status = error.response.status;
    
    // Direct quota/rate limit errors
    if (status === 403 && errorDetails.error?.errors?.some((e: any) => 
        e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded')) {
      return true;
    }
    
    // Other potential rate limiting responses
    return (status === 429 || status === 403);
  }
  
  /**
   * Handle API errors consistently
   */
  private handleApiError(error: any, context: string): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (this.isRateLimitError(axiosError)) {
        console.error(`YouTube API rate limit reached during ${context}:`, axiosError.response?.data);
        throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
      }
    }
    
    console.error(`Error during ${context}:`, error);
    throw error;
  }
  
  /**
   * Generate cache key for a time window and search type
   */
  private getSearchCacheKey(window: TimeWindow, searchType: SearchType): string {
    return `${searchType}_${window.startDate.toISOString()}_${window.endDate.toISOString()}`;
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
      searchWindow = this.getLargeTimeWindow(window);
    }
    
    // Ensure we never search before YouTube's founding
    if (searchWindow.startDate < YOUTUBE_FOUNDING_DATE) {
      searchWindow.startDate = new Date(YOUTUBE_FOUNDING_DATE);
      console.log('Adjusted search window to start at YouTube founding date');
    }
    
    const cacheKey = this.getSearchCacheKey(searchWindow, searchType);
    
    // Check if we already have this search cached
    if (this.searchCache[cacheKey]) {
      console.log(`Using cached search results for ${cacheKey}`);
      apiStats.cachedSearches++;
      return this.searchCache[cacheKey];
    }
    
    try {
      // Increment API call stats
      apiStats.searchApiCalls++;
      apiStats.totalApiCalls++;
      
      const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
        params: {
          part: 'snippet',
          maxResults: this.maxResultsPerRequest,
          type: 'video',
          publishedAfter: searchWindow.startDate.toISOString(),
          publishedBefore: searchWindow.endDate.toISOString(),
          // Add search query parameter based on search type
          q: this.getSearchQuery(searchType),
          key: this.apiKey,
        },
      });
      
      const videoIds = response.data.items.map((item: any) => item.id.videoId);
      
      // Cache the results
      this.searchCache[cacheKey] = videoIds;
      
      return videoIds;
    } catch (error) {
      try {
        this.handleApiError(error, 'video search');
      } catch (e) {
        if (e instanceof YouTubeRateLimitError) {
          throw e;
        }
        // For other errors, log and return empty array
        console.error('Error searching videos:', error);
        return [];
      }
      return []; // This should never be reached
    }
  }
  
  /**
   * Get detailed information for a batch of videos
   */
  private async fetchVideoBatch(batchIds: string[]): Promise<any[]> {
    try {
      // Increment API call stats
      apiStats.videoDetailApiCalls++;
      apiStats.totalApiCalls++;
      
      const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
        params: {
          part: 'snippet,statistics,contentDetails,liveStreamingDetails,topicDetails,status',
          id: batchIds.join(','),
          key: this.apiKey,
        },
      });
      
      return response.data.items || [];
    } catch (error) {
      this.handleApiError(error, 'fetching video details');
      return []; // This should never be reached
    }
  }
  
  /**
   * Get detailed video information
   */
  async getVideoDetails(videoIds: string[]): Promise<Video[]> {
    if (!videoIds.length) return [];
    
    // Filter out video IDs that are already cached
    const uncachedIds = videoIds.filter(id => !this.videoCache[id]);
    
    // If all videos are cached, return from cache
    if (uncachedIds.length === 0) {
      apiStats.cachedVideoDetails += videoIds.length;
      return videoIds.map(id => this.videoCache[id]);
    }
    
    // Split IDs into batches of maxIdsPerRequest
    const batches = [];
    for (let i = 0; i < uncachedIds.length; i += this.maxIdsPerRequest) {
      batches.push(uncachedIds.slice(i, i + this.maxIdsPerRequest));
    }
    
    try {
      // Process all batches in parallel
      const batchPromises = batches.map(batchIds => this.fetchVideoBatch(batchIds));
      const batchResults = await Promise.all(batchPromises);
      const allItems = batchResults.flat();
      
      // Filter out excluded categories
      const filteredItems = filterExcludedCategories(allItems);
      
      // Process and cache results
      filteredItems.forEach((item: any) => {
        // Additional information about the video
        const isLiveStream = !!item.liveStreamingDetails;
        const isUpcoming = item.liveStreamingDetails?.scheduledStartTime && 
                         !item.liveStreamingDetails?.actualEndTime;
        const duration = item.contentDetails?.duration || '';
        
        // Check license
        const isLicensed = item.status?.license === 'youtube' ? false : true;
        
        const video: Video = {
          id: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          thumbnailUrl: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
          viewCount: parseInt(item.statistics.viewCount || '0', 10),
          channelTitle: item.snippet.channelTitle,
          categoryId: item.snippet.categoryId,
          isLiveStream,
          isUpcoming,
          duration,
          isLicensed
        };
        
        // Cache the video details
        this.videoCache[item.id] = video;
      });
      
      // Return all videos (including previously cached ones)
      return videoIds.map(id => this.videoCache[id]).filter(Boolean);
    } catch (error) {
      // If this is a rate limit error, propagate it up
      if (error instanceof YouTubeRateLimitError) {
        throw error; // Rethrow to be caught by the calling function
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