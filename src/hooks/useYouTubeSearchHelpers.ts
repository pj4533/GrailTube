import { 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos,
  getViewStats,
  YouTubeRateLimitError
} from '@/lib/youtube';
import { 
  getRandomPastDate,
  createInitialTimeWindow,
  delay
} from '@/lib/utils';
import { TimeWindow, SearchType } from '@/types';
import { STATUS_MESSAGE_DELAY_MS } from '@/lib/constants';

/**
 * Perform a search on a single time window
 */
export const executeSearch = async (
  timeWindow: TimeWindow,
  searchType: SearchType,
  isCancelled: boolean,
  setStatusMessage: (message: string | null) => void,
  onReroll: () => Promise<void>
): Promise<{
  videoIds: string[],
  videoDetails: any[],
  stats: any,
  rareVideos: any[]
} | null> => {
  try {
    // Check if the search has been cancelled
    if (isCancelled) {
      return null;
    }
    
    // Always using 30-day window for Unedited search type
    const windowDescription = '1-month window';
      
    setStatusMessage(`Scanning YouTube videos from ${timeWindow.startDate.toLocaleDateString()} (${windowDescription})`);
    
    // Check again if the search has been cancelled before making the API request
    if (isCancelled) {
      return null;
    }
    
    const videoIds = await searchVideosInTimeWindow(timeWindow, searchType);
    
    // Check if search was cancelled during this operation
    if (isCancelled) {
      return null;
    }
    
    if (videoIds.length === 0) {
      // No videos found at all, immediately reroll to a new date
      setStatusMessage(`No videos found in this time period. Trying another date...`);
      await delay(STATUS_MESSAGE_DELAY_MS);
      
      // Check if cancelled during delay
      if (isCancelled) {
        return null;
      }
      
      await onReroll();
      return null;
    }
    
    setStatusMessage(`Found ${videoIds.length} potential unedited videos! Analyzing view counts...`);
    
    // Check if cancelled before getting details
    if (isCancelled) {
      return null;
    }
    
    const videoDetails = await getVideoDetails(videoIds);
    
    // Check if search was cancelled during this operation
    if (isCancelled) {
      return null;
    }
    
    // Get view statistics
    const stats = getViewStats(videoDetails);
    
    // Filter for videos with less than 10 views
    const rareVideos = filterRareVideos(videoDetails);
    
    return { videoIds, videoDetails, stats, rareVideos };
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

/**
 * Create a new time window and prepare for a new search
 */
export const prepareNewSearch = (
  newRerollCount: number,
  setStatusMessage: (message: string | null) => void
): { randomDate: Date, newWindow: TimeWindow } => {
  setStatusMessage(`Reroll #${newRerollCount}: Trying a completely different time period...`);
  
  // Get a fresh random date and create a new window
  const randomDate = getRandomPastDate();
  const newWindow = createInitialTimeWindow(randomDate, true);
  
  return { randomDate, newWindow };
};

/**
 * Determines the next action based on search results
 */
export const processSearchResults = async (
  results: { videoIds: string[], videoDetails: any[], stats: any, rareVideos: any[] },
  isCancelled: boolean,
  setStatusMessage: (message: string | null) => void,
  onReroll: () => Promise<void>
): Promise<any[] | null> => {
  const { stats, rareVideos } = results;
  
  if (rareVideos.length === 0) {
    // No videos with less than 10 views found
    // Show the stats in the status message
    setStatusMessage(`Searching... (analyzing ${stats.totalVideos} videos)`);
    
    // No rare videos found, reroll to a different date after showing stats
    await delay(STATUS_MESSAGE_DELAY_MS * 2);
    
    // Check if cancelled during delay
    if (isCancelled) {
      return null;
    }
    
    await onReroll();
    return null;
  } else {
    // Success! We found rare videos with <10 views
    // Sort by viewCount (lowest first)
    const sortedVideos = [...rareVideos].sort((a, b) => a.viewCount - b.viewCount);
    return sortedVideos;
  }
};