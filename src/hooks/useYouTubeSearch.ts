import { useState } from 'react';
import { addMinutes, subMinutes } from 'date-fns';
import { 
  getRandomPastDate,
  createInitialTimeWindow, 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos,
  expandTimeWindow,
  TimeWindow 
} from '@/lib/youtube';
import { Video } from '@/types';

export function useYouTubeSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentWindow, setCurrentWindow] = useState<TimeWindow | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expansionCount, setExpansionCount] = useState<number>(0);

  // Creates a new time window with given parameters
  const createTimeWindow = (centerTime: Date, durationMinutes: number): TimeWindow => {
    const halfDuration = durationMinutes / 2;
    return {
      startDate: subMinutes(centerTime, halfDuration),
      endDate: addMinutes(centerTime, halfDuration),
      durationMinutes
    };
  };

  // Process search results adaptively based on video count
  const processAdaptiveSearch = async (
    videoIds: string[], 
    videoDetails: Video[], 
    timeWindow: TimeWindow, 
    currentStep: number
  ) => {
    let nextExpansionStep: TimeWindow;
    const centerTime = new Date((timeWindow.startDate.getTime() + timeWindow.endDate.getTime()) / 2);
    
    // Adaptive window sizing based on video volume
    if (videoIds.length > 200) {
      // Very busy time period - contract slightly
      setStatusMessage(`Found ${videoDetails.length} videos in a busy period. Refining search...`);
      const newDuration = Math.max(timeWindow.durationMinutes * 0.8, 30);
      nextExpansionStep = createTimeWindow(centerTime, newDuration);
    } else if (videoIds.length > 50) {
      // Moderately busy - expand slower
      setStatusMessage(`Found ${videoDetails.length} videos, but none are rare treasures yet. Expanding search moderately...`);
      const newDuration = timeWindow.durationMinutes * 1.5;
      nextExpansionStep = createTimeWindow(centerTime, newDuration);
    } else {
      // Not many videos - expand more aggressively
      setStatusMessage(`Found ${videoDetails.length} videos, but none are rare treasures yet. Expanding search aggressively...`);
      nextExpansionStep = expandTimeWindow(timeWindow);
    }
    
    const nextStep = currentStep + 1;
    setExpansionCount(nextStep - 1);
    
    // Small delay to show the expansion message
    await new Promise(resolve => setTimeout(resolve, 1200));
    setCurrentWindow(nextExpansionStep);
    await searchWithExpansion(nextExpansionStep, nextStep);
  };

  // Main search function with recursive expansion
  const searchWithExpansion = async (timeWindow: TimeWindow, currentStep: number = 1) => {
    setStatusMessage(`Step ${currentStep}: Scanning for videos in this ${timeWindow.durationMinutes} min window`);
    
    // Search for videos in the current window
    const videoIds = await searchVideosInTimeWindow(timeWindow);
    
    if (videoIds.length === 0) {
      // No videos found, keep expanding the time window with no max limit
      const nextStep = currentStep + 1;
      setExpansionCount(nextStep - 1);
      
      // Calculate next window size for status message
      const newWindow = expandTimeWindow(timeWindow);
      const expansionFactor = Math.round(newWindow.durationMinutes / timeWindow.durationMinutes);
      
      setStatusMessage(`No videos found. Expanding search range ${expansionFactor}x to ${newWindow.durationMinutes} minutes...`);
      
      // Small delay to show the expansion message
      await new Promise(resolve => setTimeout(resolve, 1200));
      setCurrentWindow(newWindow);
      await searchWithExpansion(newWindow, nextStep);
    } else {
      // Videos found, get their details
      setStatusMessage(`Found ${videoIds.length} videos! Analyzing view counts to find hidden gems...`);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Filter for videos with less than 5 views
      const rareVideos = filterRareVideos(videoDetails);
      
      if (rareVideos.length === 0) {
        // No rare videos found, use adaptive expansion
        await processAdaptiveSearch(videoIds, videoDetails, timeWindow, currentStep);
      } else {
        // Success! We found rare videos
        setVideos(rareVideos);
        setStatusMessage(null);
        setIsLoading(false);
      }
    }
  };

  // Start search from a random date
  const startSearch = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setExpansionCount(0);
    
    try {
      // Get a random date and create initial 60-minute window
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate);
      setCurrentWindow(initialWindow);
      
      // Start the search process with step 1
      await searchWithExpansion(initialWindow, 1);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    videos,
    currentWindow,
    statusMessage,
    error,
    expansionCount,
    startSearch
  };
}