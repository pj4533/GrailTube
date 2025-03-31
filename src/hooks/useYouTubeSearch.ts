import { useState } from 'react';
import { 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos,
  getViewStats,
  apiStats,
  YouTubeRateLimitError
} from '@/lib/youtube';
import { 
  getRandomPastDate,
  createInitialTimeWindow,
  delay
} from '@/lib/utils';
import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
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
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  const [searchType, setSearchType] = useState<SearchType>(SearchType.RandomTime);

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
   * Perform a search on a single time window and reroll if no videos found
   */
  const performSearch = async (timeWindow: TimeWindow): Promise<void> => {
    try {
      const windowDescription = searchType === SearchType.Unedited 
        ? '1-week window' 
        : '96-hour window';
        
      setStatusMessage(`Scanning YouTube videos from ${timeWindow.startDate.toLocaleDateString()} (${windowDescription})`);
      
      // Search for videos in the current window with current search type
      const videoIds = await searchVideosInTimeWindow(timeWindow, searchType);
      
      if (videoIds.length === 0) {
        // No videos found at all, immediately reroll to a new date
        setStatusMessage(`No videos found in this time period. Trying another date...`);
        await delay(STATUS_MESSAGE_DELAY_MS);
        await performReroll();
        return;
      }
      
      // Videos found, get their details
      const searchTypeLabel = searchType === SearchType.Unedited ? 'unedited ' : '';
      setStatusMessage(`Found ${videoIds.length} potential ${searchTypeLabel}videos! Analyzing view counts...`);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Get view statistics
      const stats = getViewStats(videoDetails);
      setViewStats(stats);
      
      // Filter for videos with less than 10 views
      const rareVideos = filterRareVideos(videoDetails);
      
      if (rareVideos.length === 0) {
        // No videos with less than 10 views found
        // Show the stats in the status message
        setStatusMessage(`Found ${stats.totalVideos} ${searchTypeLabel}videos: ${stats.zeroViews} with 0 views, ${stats.underTenViews} with <10 views, ${stats.underHundredViews} with <100 views, ${stats.underThousandViews} with <1000 views`);
        
        // No rare videos found, reroll to a different date after showing stats
        await delay(STATUS_MESSAGE_DELAY_MS * 2);
        await performReroll();
      } else {
        // Success! We found rare videos with <10 views
        // Sort by viewCount (lowest first)
        const sortedVideos = [...rareVideos].sort((a, b) => a.viewCount - b.viewCount);
        setVideos(sortedVideos);
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
      
      // Get a fresh random date and create a new window based on search type
      const randomDate = getRandomPastDate();
      const newWindow = createInitialTimeWindow(randomDate, searchType === SearchType.Unedited);
      setCurrentWindow(newWindow);
      
      // Search with the new window
      await performSearch(newWindow);
    } catch (error) {
      handleError(error, 'reroll');
    }
  };

  /**
   * Start search from a random date with the specified search type
   */
  const startSearch = async (type: SearchType = searchType): Promise<void> => {
    // If the selected search type is different, update it
    if (type !== searchType) {
      setSearchType(type);
    }
    
    // Reset all state
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setRerollCount(0);
    
    // Reset API call stats
    apiStats.reset();
    
    try {
      // Get a random date and create initial time window based on search type
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate, type === SearchType.Unedited);
      setCurrentWindow(initialWindow);
      
      // Start the search process with the current search type
      await performSearch(initialWindow);
    } catch (err) {
      handleError(err, 'initial search');
    }
  };

  /**
   * Change search type and clear results
   */
  const changeSearchType = (type: SearchType): void => {
    // Only process if it's a different type and not loading
    if (type !== searchType && !isLoading) {
      setSearchType(type);
      setVideos([]);
      setStatusMessage(null);
      setError(null);
      setViewStats(null);
      setCurrentWindow(null);
    }
  };

  return {
    isLoading,
    videos,
    currentWindow,
    statusMessage,
    error,
    viewStats,
    apiStats,
    searchType,
    startSearch,
    changeSearchType
  };
}