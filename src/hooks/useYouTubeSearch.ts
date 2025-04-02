import { 
  getRandomPastDate,
  createInitialTimeWindow
} from '@/lib/utils';
import { TimeWindow, SearchType } from '@/types';
import { MAX_REROLLS } from '@/lib/constants';
import { useYouTubeSearchState } from './useYouTubeSearchState';
import { executeSearch, prepareNewSearch, processSearchResults } from './useYouTubeSearchHelpers';
import { apiStats } from '@/lib/youtube';

/**
 * Custom hook to handle YouTube search for rare videos
 */
export function useYouTubeSearch() {
  const { state, actions, createAbortController, getAbortController, abortCurrentController } = useYouTubeSearchState();
  const {
    isLoading, videos, currentWindow, statusMessage, error,
    rerollCount, viewStats, searchType, keyword, isCancelled
  } = state;
  
  const {
    setIsLoading, setVideos, setCurrentWindow, setStatusMessage,
    setError, setRerollCount, setViewStats, 
    setIsCancelled, resetState, handleError
  } = actions;

  /**
   * Perform a search on a single time window and reroll if no videos found
   */
  const performSearch = async (timeWindow: TimeWindow): Promise<void> => {
    try {
      // Check if the search has been cancelled
      if (isCancelled) {
        return;
      }
      
      const searchResults = await executeSearch(
        timeWindow,
        searchType,
        isCancelled,
        setStatusMessage,
        performReroll
      );
      
      // If search was cancelled or no results found that required reroll
      if (!searchResults) {
        return;
      }
      
      const { stats, rareVideos } = searchResults;
      
      // Update view stats
      setViewStats(stats);
      
      // Process the search results
      const processedVideos = await processSearchResults(
        searchResults,
        isCancelled,
        setStatusMessage,
        performReroll
      );
      
      if (processedVideos) {
        setVideos(processedVideos);
        setStatusMessage(null);
        setIsLoading(false);
      }
    } catch (error) {
      // Check if this is an abort error (from the AbortController)
      if (error instanceof DOMException && error.name === 'AbortError') {
        // This is expected when the search is cancelled, don't show an error
        return;
      }
      
      handleError(error, 'search');
    }
  };

  /**
   * Start a completely new search with a random time period
   */
  const performReroll = async (): Promise<void> => {
    try {
      // Set loading state and clear videos to show search status screen
      setIsLoading(true);
      setVideos([]);
      setError(null);
      setStatusMessage(null);
      setIsCancelled(false);
      
      // Create a new abort controller for this search
      createAbortController();
      
      // Check if the search has been cancelled
      if (isCancelled) {
        return;
      }
      
      // Increment reroll count
      const newRerollCount = rerollCount + 1;
      setRerollCount(newRerollCount);
      
      // Check if we've reached the maximum number of rerolls
      if (newRerollCount > MAX_REROLLS) {
        setError(`After ${MAX_REROLLS} different time periods, couldn't find any videos with zero views. Try again later!`);
        setIsLoading(false);
        return;
      }
      
      const { newWindow } = prepareNewSearch(
        searchType,
        newRerollCount,
        setStatusMessage
      );
      
      setCurrentWindow(newWindow);
      
      // Search with the new window
      await performSearch(newWindow);
    } catch (error) {
      // Check if this is an abort error
      if (error instanceof DOMException && error.name === 'AbortError') {
        // This is expected when the search is cancelled, don't show an error
        return;
      }
      
      handleError(error, 'reroll');
    }
  };

  /**
   * Start search from a random date with Unedited search type
   */
  const startSearch = async (): Promise<void> => {
    // Reset all state
    resetState();
    
    try {
      // Get a random date and create initial time window for Unedited search
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate, true);
      setCurrentWindow(initialWindow);
      
      // Start the search process
      await performSearch(initialWindow);
    } catch (err) {
      handleError(err, 'initial search');
    }
  };
  
  /**
   * Cancel the current search operation
   */
  const cancelSearch = (): void => {
    if (isLoading) {
      // First set the cancelled flag to true immediately
      // This ensures all subsequent operations will terminate
      setIsCancelled(true);
      
      // Then abort any in-progress API calls
      abortCurrentController();
      
      // Create a new abort controller for future operations
      createAbortController();
      
      // Clear loading state and set status message
      setStatusMessage("Search cancelled");
      setIsLoading(false);
      
      // Reset reroll count to prevent further automatic searches
      setRerollCount(0);
      
      // Keep the current window and view stats for reference
      // but don't process any more results
      
      console.log('Search cancelled completely'); // Debug log
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
    cancelSearch,
    performReroll
  };
}