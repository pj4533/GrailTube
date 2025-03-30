import axios from 'axios';
import { Video, TimeWindow } from '@/types';
import { createTimeWindow, getWindowCenter } from './utils';
import { 
  YOUTUBE_API_URL, 
  RARE_VIEW_THRESHOLD,
  AGGRESSIVE_EXPANSION_FACTOR
} from './constants';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const MAX_RESULTS_PER_REQUEST = 50;
const MAX_IDS_PER_REQUEST = 50;

// Simple in-memory cache for API calls
const videoCache: Record<string, Video> = {};
const searchCache: Record<string, string[]> = {};

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

// Expand time window with given expansion factor
export function expandTimeWindow(window: TimeWindow, factor = AGGRESSIVE_EXPANSION_FACTOR): TimeWindow {
  // Import constants
  const { YOUTUBE_FOUNDING_DATE, MAX_WINDOW_DURATION_MINUTES } = require('./constants');
  
  // Calculate new duration, but cap it to prevent excessive expansion
  const newDuration = Math.min(window.durationMinutes * factor, MAX_WINDOW_DURATION_MINUTES);
  
  // Get center time
  const centerTime = getWindowCenter(window);
  
  // Create the new time window
  let newWindow = createTimeWindow(centerTime, newDuration);
  
  // If start date is before YouTube's founding, adjust the window
  if (newWindow.startDate < YOUTUBE_FOUNDING_DATE) {
    // Calculate how much we're below the founding date
    const underflow = YOUTUBE_FOUNDING_DATE.getTime() - newWindow.startDate.getTime();
    
    // Create an adjusted window starting from YouTube's founding date
    // We keep the same duration but shift the center forward
    const adjustedCenter = new Date(centerTime.getTime() + underflow);
    return createTimeWindow(adjustedCenter, newDuration);
  }
  
  return newWindow;
}

// Generate cache key for a time window
function getSearchCacheKey(window: TimeWindow): string {
  return `${window.startDate.toISOString()}_${window.endDate.toISOString()}`;
}

// Error type for YouTube API rate limits
export class YouTubeRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'YouTubeRateLimitError';
  }
}

// Get videos uploaded in a time window with caching
export async function searchVideosInTimeWindow(window: TimeWindow): Promise<string[]> {
  // Import the founding date
  const { YOUTUBE_FOUNDING_DATE } = require('./constants');
  
  // Ensure we never search before YouTube's founding
  let searchWindow = {...window};
  if (searchWindow.startDate < YOUTUBE_FOUNDING_DATE) {
    searchWindow.startDate = new Date(YOUTUBE_FOUNDING_DATE);
    console.log('Adjusted search window to start at YouTube founding date');
  }
  
  const cacheKey = getSearchCacheKey(searchWindow);
  
  // Check if we already have this search cached
  if (searchCache[cacheKey]) {
    console.log(`Using cached search results for ${cacheKey}`);
    apiStats.cachedSearches++;
    return searchCache[cacheKey];
  }
  
  try {
    // Increment API call stats
    apiStats.searchApiCalls++;
    apiStats.totalApiCalls++;
    
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: MAX_RESULTS_PER_REQUEST,
        type: 'video',
        publishedAfter: searchWindow.startDate.toISOString(),
        publishedBefore: searchWindow.endDate.toISOString(),
        key: API_KEY,
      },
    });
    
    const videoIds = response.data.items.map((item: any) => item.id.videoId);
    
    // Cache the results
    searchCache[cacheKey] = videoIds;
    
    return videoIds;
  } catch (error: any) {
    // Check for specific rate limiting error codes from YouTube API
    if (error.response && error.response.data) {
      const errorDetails = error.response.data;
      
      // YouTube API quota exceeded (403 with specific error codes)
      if (error.response.status === 403 && 
          (errorDetails.error?.errors?.some((e: any) => 
            e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded'))) {
        console.error('YouTube API quota exceeded:', errorDetails);
        throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
      }
      
      // Other 403 or 429 errors that might indicate rate limiting
      if (error.response.status === 429 || error.response.status === 403) {
        console.error('Possible rate limiting from YouTube API:', errorDetails);
        throw new YouTubeRateLimitError('YouTube API rate limit reached. Please try again later.');
      }
    }
    
    // Log other errors but don't stop the search process for non-rate-limit errors
    console.error('Error searching videos:', error);
    return [];
  }
}

// Get detailed information for multiple videos with batching and caching
export async function getVideoDetails(videoIds: string[]): Promise<Video[]> {
  if (!videoIds.length) return [];
  
  // Filter out video IDs that are already cached
  const uncachedIds = videoIds.filter(id => !videoCache[id]);
  
  // If all videos are cached, return from cache
  if (uncachedIds.length === 0) {
    apiStats.cachedVideoDetails += videoIds.length;
    return videoIds.map(id => videoCache[id]);
  }
  
  // Split IDs into batches of MAX_IDS_PER_REQUEST
  const batches = [];
  for (let i = 0; i < uncachedIds.length; i += MAX_IDS_PER_REQUEST) {
    batches.push(uncachedIds.slice(i, i + MAX_IDS_PER_REQUEST));
  }
  
  try {
    // Process all batches in parallel
    const batchPromises = batches.map(async (batchIds) => {
      // Increment API call stats
      apiStats.videoDetailApiCalls++;
      apiStats.totalApiCalls++;
      
      try {
        const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
          params: {
            part: 'snippet,statistics,contentDetails,liveStreamingDetails',
            id: batchIds.join(','),
            key: API_KEY,
          },
        });
        
        return response.data.items || [];
      } catch (error: any) {
        // Check for rate limiting errors
        if (error.response && error.response.data) {
          const errorDetails = error.response.data;
          
          // Handle quota or rate limit errors
          if (error.response.status === 403 && 
              (errorDetails.error?.errors?.some((e: any) => 
                e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded'))) {
            throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
          }
          
          // Other 403 or 429 errors that might indicate rate limiting
          if (error.response.status === 429 || error.response.status === 403) {
            throw new YouTubeRateLimitError('YouTube API rate limit reached. Please try again later.');
          }
        }
        
        // For other errors, log and return an empty array
        console.error('Error fetching batch of video details:', error);
        return [];
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    const allItems = batchResults.flat();
    
    // Process and cache results
    allItems.forEach((item: any) => {
      // Additional information about the video
      const isLiveStream = !!item.liveStreamingDetails;
      const isUpcoming = item.liveStreamingDetails?.scheduledStartTime && !item.liveStreamingDetails?.actualEndTime;
      const duration = item.contentDetails?.duration || '';
      
      const video: Video = {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(item.statistics.viewCount, 10),
        channelTitle: item.snippet.channelTitle,
        isLiveStream,
        isUpcoming,
        duration
      };
      
      // Cache the video details
      videoCache[item.id] = video;
    });
    
    // Return all videos (including previously cached ones)
    return videoIds.map(id => videoCache[id]).filter(Boolean);
  } catch (error) {
    // If this is a rate limit error, propagate it up
    if (error instanceof YouTubeRateLimitError) {
      throw error; // Rethrow to be caught by the calling function
    }
    
    console.error('Error getting video details:', error);
    // Return any cached videos we have for non-rate-limit errors
    return videoIds.map(id => videoCache[id]).filter(Boolean);
  }
}

// Find videos with exactly zero views that are not live streams or upcoming streams
export function filterRareVideos(videos: Video[]): Video[] {
  return videos.filter(video => {
    // Must have exactly zero views
    if (video.viewCount !== RARE_VIEW_THRESHOLD) return false;
    
    // Filter out live streams and upcoming streams
    if (video.isLiveStream || video.isUpcoming) return false;
    
    // Filter out videos with "stream" or "live" in the title (often stream announcements)
    const lowerTitle = video.title.toLowerCase();
    if (lowerTitle.includes('stream') || 
        lowerTitle.includes('live') || 
        lowerTitle.includes('premiere')) return false;
    
    // Include this video (keeping short videos as they can be interesting!)
    return true;
  });
}