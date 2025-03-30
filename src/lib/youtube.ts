import axios, { AxiosError, AxiosResponse } from 'axios';
import { Video, TimeWindow, ViewStats } from '@/types';
import { 
  YOUTUBE_API_URL, 
  RARE_VIEW_THRESHOLD,
  EXCLUDED_CATEGORIES
} from './constants';

// Error type for YouTube API rate limits
export class YouTubeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeRateLimitError';
  }
}

// API call stats for monitoring
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
 * YouTube API Service - Encapsulates all YouTube API interactions
 */
class YouTubeApiService {
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
   * Generate cache key for a time window
   */
  private getSearchCacheKey(window: TimeWindow): string {
    return `${window.startDate.toISOString()}_${window.endDate.toISOString()}`;
  }
  
  /**
   * Search for videos in a specific time window
   */
  async searchVideosInTimeWindow(window: TimeWindow): Promise<string[]> {
    // Import the founding date
    const { YOUTUBE_FOUNDING_DATE } = require('./constants');
    
    // Ensure we never search before YouTube's founding
    let searchWindow = {...window};
    if (searchWindow.startDate < YOUTUBE_FOUNDING_DATE) {
      searchWindow.startDate = new Date(YOUTUBE_FOUNDING_DATE);
      console.log('Adjusted search window to start at YouTube founding date');
    }
    
    const cacheKey = this.getSearchCacheKey(searchWindow);
    
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
      
      // Construct videoCategoryId parameter to exclude unwanted categories
      // Note: YouTube API doesn't directly support excluding categories, 
      // so we'll need to filter out unwanted categories after fetching details
      
      const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
        params: {
          part: 'snippet',
          maxResults: this.maxResultsPerRequest,
          type: 'video',
          publishedAfter: searchWindow.startDate.toISOString(),
          publishedBefore: searchWindow.endDate.toISOString(),
          // Add random search query parameter to get more diverse results
          q: this.getRandomSearchTerm(),
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
      
      // Filter out excluded categories and process results
      const filteredItems = allItems.filter((item: any) => {
        // Check if the video is in an excluded category
        const categoryId = item.snippet?.categoryId;
        if (categoryId && EXCLUDED_CATEGORIES.includes(categoryId)) {
          console.log(`Filtered out video in excluded category: "${item.snippet.title}" (category: ${categoryId})`);
          return false;
        }
        
        // Include videos that don't have a category or aren't in excluded categories
        return true;
      });
      
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
   * Get view statistics from the video collection
   */
  getViewStats(videos: Video[]): ViewStats {
    // Count different view categories
    let underTenViews = 0;
    let underHundredViews = 0;
    let underThousandViews = 0;
    let zeroViews = 0;
    
    // Filter out live streams and announcements first
    const filteredVideos = videos.filter(video => {
      // Filter out live streams and upcoming streams
      if (video.isLiveStream || video.isUpcoming) return false;
      
      // Filter out videos with "stream" or "live" in the title (often stream announcements)
      const lowerTitle = video.title.toLowerCase();
      if (lowerTitle.includes('stream') || 
          lowerTitle.includes('live') || 
          lowerTitle.includes('premiere')) return false;
      
      // Include this video
      return true;
    });
    
    // Count videos by view thresholds
    filteredVideos.forEach(video => {
      if (video.viewCount === 0) zeroViews++;
      if (video.viewCount < 10) underTenViews++;
      if (video.viewCount < 100) underHundredViews++;
      if (video.viewCount < 1000) underThousandViews++;
    });
    
    return {
      totalVideos: filteredVideos.length,
      zeroViews,
      underTenViews,
      underHundredViews,
      underThousandViews
    };
  }
  
  /**
   * Filter videos with less than 10 views and not streams or commercial content
   */
  filterRareVideos(videos: Video[]): Video[] {
    // Define keywords that indicate commercial movie/TV purchase content
    const commercialKeywords = [
      // Movie/TV purchase indicators
      'buy', 'rent', 'purchase', 'trailer', 'official', 'hd', '4k',
      // Movie studio references
      'warner', 'disney', 'paramount', 'sony', 'universal', 'mgm', 'lionsgate',
      // Streaming services
      'netflix', 'hulu', 'amazon', 'prime video', 'hbo', 'max', 'disney+',
      // Common commercial phrases
      'now available', 'digital', 'bluray', 'blu-ray', 'dvd', 
      'full movie', 'full episode', 'season', 'episode'
    ];
    
    // Extended TV show indicators
    const tvShowKeywords = [
      'tv series', 'tv show', 'television', 'episode', 'season',
      'watch now', 'streaming now', 'now streaming'
    ];
    
    return videos.filter(video => {
      // Must have less than 10 views
      if (video.viewCount >= 10) return false;
      
      // Filter out live streams and upcoming streams
      if (video.isLiveStream || video.isUpcoming) return false;
      
      // Convert title and description to lowercase for case-insensitive matching
      const lowerTitle = video.title.toLowerCase();
      const lowerDescription = video.description?.toLowerCase() || '';
      
      // Filter out videos with "stream" or "live" in the title (often stream announcements)
      if (lowerTitle.includes('stream') || 
          lowerTitle.includes('live') || 
          lowerTitle.includes('premiere')) return false;
      
      // Check for commercial keywords in title or description
      for (const keyword of commercialKeywords) {
        if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
          console.log(`Filtered out commercial video: "${video.title}" (matched keyword: ${keyword})`);
          return false;
        }
      }
      
      // Check for TV show indicators
      for (const keyword of tvShowKeywords) {
        if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
          console.log(`Filtered out TV show video: "${video.title}" (matched keyword: ${keyword})`);
          return false;
        }
      }
      
      // Filter videos with high production value indicators
      if (video.title.includes('©') || 
          video.description?.includes('©') || 
          video.title.includes('™') || 
          video.description?.includes('™')) {
        console.log(`Filtered out commercial video: "${video.title}" (matched copyright/trademark)`);
        return false;
      }
      
      // Include this video (passed all filter checks)
      return true;
    });
  }
}

// Create a singleton instance of the YouTube API service
const youtubeApiService = new YouTubeApiService();

// Export methods for use elsewhere
export const searchVideosInTimeWindow = (window: TimeWindow): Promise<string[]> => 
  youtubeApiService.searchVideosInTimeWindow(window);

export const getVideoDetails = (videoIds: string[]): Promise<Video[]> => 
  youtubeApiService.getVideoDetails(videoIds);

export const filterRareVideos = (videos: Video[]): Video[] => 
  youtubeApiService.filterRareVideos(videos);
  
export const getViewStats = (videos: Video[]): ViewStats =>
  youtubeApiService.getViewStats(videos);