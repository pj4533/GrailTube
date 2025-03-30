import { useState } from 'react';
import { 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos,
  apiStats,
  YouTubeRateLimitError
} from '@/lib/youtube';
import { 
  getRandomPastDate,
  createInitialTimeWindow,
  delay
} from '@/lib/utils';
import { Video, TimeWindow } from '@/types';
import {
  MAX_REROLLS,
  STATUS_MESSAGE_DELAY_MS
} from '@/lib/constants';

/**
 * Custom hook to handle YouTube search for rare videos
 */
export function useYouTubeSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentWindow, setCurrentWindow] = useState<TimeWindow | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rerollCount, setRerollCount] = useState<number>(0);

  /**
   * Handle errors consistently throughout the hook
   */
  const handleError = (err: unknown, context: string): void => {
    if (err instanceof YouTubeRateLimitError) {
      setError(`YouTube API rate limit reached: ${err.message}. Please try again later.`);
    } else {
      console.error(`Error during ${context}:`, err);
      setError('An unexpected error occurred. Please try again later.');
    }
    setIsLoading(false);
  };

  /**
   * Perform a search on a single 24-hour window and reroll if no videos found
   */
  const performSearch = async (timeWindow: TimeWindow): Promise<void> => {
    try {
      setStatusMessage(`Scanning YouTube videos from ${timeWindow.startDate.toLocaleDateString()} (24-hour window)`);
      
      // Search for videos in the current window
      const videoIds = await searchVideosInTimeWindow(timeWindow);
      
      if (videoIds.length === 0) {
        // No videos found at all, immediately reroll to a new date
        setStatusMessage(`No videos found in this time period. Trying another date...`);
        await delay(STATUS_MESSAGE_DELAY_MS);
        await performReroll();
        return;
      }
      
      // Videos found, get their details
      setStatusMessage(`Found ${videoIds.length} videos! Checking for undiscovered gems with zero views...`);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Filter for videos with zero views
      const rareVideos = filterRareVideos(videoDetails);
      
      if (rareVideos.length === 0) {
        // No rare videos found, reroll to a different date
        await performReroll();
      } else {
        // Success! We found rare videos
        setVideos(rareVideos);
        setStatusMessage(null);
        setIsLoading(false);
      }
    } catch (error) {
      handleError(error, 'search');
    }
  };

  /**
   * Start a completely new search with a random time period
   */
  const performReroll = async (): Promise<void> => {
    try {
      // Increment reroll count
      const newRerollCount = rerollCount + 1;
      setRerollCount(newRerollCount);
      
      // Check if we've reached the maximum number of rerolls
      if (newRerollCount > MAX_REROLLS) {
        setError(`After ${MAX_REROLLS} different time periods, couldn't find any videos with zero views. Try again later!`);
        setIsLoading(false);
        return;
      }
      
      setStatusMessage(`Reroll #${newRerollCount}: Trying a completely different time period...`);
      
      // Brief delay to show the reroll message
      await delay(STATUS_MESSAGE_DELAY_MS);
      
      // Get a fresh random date and create a new window
      const randomDate = getRandomPastDate();
      const newWindow = createInitialTimeWindow(randomDate);
      setCurrentWindow(newWindow);
      
      // Search with the new window
      await performSearch(newWindow);
    } catch (error) {
      handleError(error, 'reroll');
    }
  };

  /**
   * Start search from a random date
   */
  const startSearch = async (): Promise<void> => {
    // Reset all state
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setRerollCount(0);
    
    // Reset API call stats
    apiStats.reset();
    
    try {
      // Get a random date and create initial 24-hour window
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate);
      setCurrentWindow(initialWindow);
      
      // Start the search process
      await performSearch(initialWindow);
    } catch (err) {
      handleError(err, 'initial search');
    }
  };

  return {
    isLoading,
    videos,
    currentWindow,
    statusMessage,
    error,
    apiStats,
    startSearch
  };
}