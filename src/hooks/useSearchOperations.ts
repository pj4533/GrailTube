import { useCallback, useRef } from 'react';
import { 
  getRandomYearMonth,
  getDateFromYearMonth,
  createInitialTimeWindow,
  getRandomPastDate
} from '@/lib/utils';
import { TimeWindow, SearchType } from '@/types';
import { executeSearch, processSearchResults } from './useYouTubeSearchHelpers';
import { apiStats } from '@/lib/youtube';
import { SearchState, SearchStateActions } from './useYouTubeSearchState';
import { UNEDITED_WINDOW_DAYS } from '@/lib/constants';

// Maximum attempts to find a non-overlapping window
const MAX_WINDOW_GENERATION_ATTEMPTS = 50;

/**
 * Hook that encapsulates YouTube search operations
 */
export function useSearchOperations(
  state: SearchState,
  actions: SearchStateActions,
  createAbortController: () => AbortController,
  abortCurrentController: () => void
) {
  const {
    isLoading, isCancelled, rerollCount, searchType
  } = state;
  
  const {
    setIsLoading, setVideos, setCurrentWindow, setStatusMessage,
    setError, setRerollCount, setViewStats, 
    setIsCancelled, resetState, handleError,
    addSearchedDate, hasSearchedDate,
    addSearchedWindow, hasOverlappingWindow
  } = actions;

  // Use refs to solve the circular dependency issue
  const performSearchRef = useRef<(timeWindow: TimeWindow) => Promise<void>>();
  const performRerollRef = useRef<() => Promise<void>>();
  
  /**
   * Generate a non-overlapping time window
   * Returns a unique window that doesn't overlap with any previously searched windows
   */
  const generateNonOverlappingWindow = useCallback((): TimeWindow | null => {
    let attempts = 0;
    
    // Try to find a window that doesn't overlap with any previous windows
    while (attempts < MAX_WINDOW_GENERATION_ATTEMPTS) {
      // Get a random year-month
      let yearMonth;
      let yearMonthAttempts = 0;
      const maxYearMonthAttempts = 20;
      
      // Try to find a year-month that hasn't been searched
      do {
        yearMonth = getRandomYearMonth();
        yearMonthAttempts++;
        
        if (yearMonthAttempts >= maxYearMonthAttempts) {
          // If we can't find an unused year-month after several attempts, 
          // we'll try with a completely random date instead
          break;
        }
      } while (hasSearchedDate(yearMonth));
      
      // Once we have a year-month (or gave up finding an unused one)
      // Create a window either from the year-month or from a completely random date
      let centerDate: Date;
      let newWindow: TimeWindow;
      
      if (yearMonthAttempts < maxYearMonthAttempts) {
        // We found an unused year-month, so create a window from it
        centerDate = getDateFromYearMonth(yearMonth);
        newWindow = createInitialTimeWindow(centerDate, true);
        // Also track that we used this year-month
        addSearchedDate(yearMonth);
      } else {
        // We couldn't find an unused year-month, so pick a completely random date
        // This gives us more flexibility to find non-overlapping windows
        centerDate = getRandomPastDate();
        newWindow = createInitialTimeWindow(centerDate, true);
      }
      
      // Check if this window overlaps with any previous windows
      if (!hasOverlappingWindow(newWindow)) {
        // Success! We found a non-overlapping window
        return newWindow;
      }
      
      attempts++;
    }
    
    // If we've tried too many times and still can't find a non-overlapping window,
    // we'll have to give up and accept some overlap
    const randomDate = getRandomPastDate();
    return createInitialTimeWindow(randomDate, true);
  }, [hasSearchedDate, addSearchedDate, hasOverlappingWindow]);

  /**
   * Reroll function implementation - will be assigned to ref
   */
  performRerollRef.current = async (): Promise<void> => {
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
      
      // Generate a new non-overlapping window
      setStatusMessage(`Reroll #${newRerollCount}: Finding a new time period to search...`);
      const newWindow = generateNonOverlappingWindow();
      
      if (!newWindow) {
        setError("Failed to generate a new search window. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Set the new window and track it
      setCurrentWindow(newWindow);
      addSearchedWindow(newWindow);
      
      // Format date range for display
      const startDate = newWindow.startDate.toLocaleDateString();
      const endDate = newWindow.endDate.toLocaleDateString();
      const windowDays = UNEDITED_WINDOW_DAYS;
      const windowsCount = actions.getSearchedWindowsCount();
      
      // Update status to show which period we're searching
      setStatusMessage(`Searching ${windowDays}-day window from ${startDate} to ${endDate} (window #${windowsCount})`);
      
      // Search with the new window
      await performSearchRef.current?.(newWindow);
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
   * Search function implementation - will be assigned to ref
   */
  performSearchRef.current = async (timeWindow: TimeWindow): Promise<void> => {
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
        async () => await performRerollRef.current?.()
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
        async () => await performRerollRef.current?.()
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
   * Perform a search on a single time window and reroll if no videos found
   */
  const performSearch = useCallback(async (timeWindow: TimeWindow): Promise<void> => {
    await performSearchRef.current?.(timeWindow);
  }, []);

  /**
   * Start a completely new search with a random time period
   */
  const performReroll = useCallback(async (): Promise<void> => {
    await performRerollRef.current?.();
  }, []);

  /**
   * Start search from a random date with Unedited search type
   */
  const startSearch = useCallback(async (): Promise<void> => {
    // Reset all state
    resetState();
    
    try {
      // Generate a non-overlapping window
      setStatusMessage('Finding a unique time period to search...');
      const initialWindow = generateNonOverlappingWindow();
      
      if (!initialWindow) {
        setError("Failed to generate a search window. Please try again.");
        setIsLoading(false);
        return;
      }
      
      // Set the window and track it
      setCurrentWindow(initialWindow);
      addSearchedWindow(initialWindow);
      
      // Format date range for display
      const startDate = initialWindow.startDate.toLocaleDateString();
      const endDate = initialWindow.endDate.toLocaleDateString();
      const windowDays = UNEDITED_WINDOW_DAYS;
      const windowsCount = actions.getSearchedWindowsCount();
      
      // Update status to show which period we're searching
      setStatusMessage(`Starting search in ${windowDays}-day window from ${startDate} to ${endDate} (window #${windowsCount})`);
      
      // Start the search process
      await performSearch(initialWindow);
    } catch (err) {
      handleError(err, 'initial search');
    }
  }, [resetState, actions, setCurrentWindow, setStatusMessage, setError, setIsLoading, addSearchedWindow, performSearch, handleError, generateNonOverlappingWindow]);
  
  /**
   * Cancel the current search operation
   */
  const cancelSearch = useCallback((): void => {
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
  }, [isLoading, setIsCancelled, abortCurrentController, createAbortController, 
      setStatusMessage, setIsLoading, setRerollCount]);

  return {
    performSearch,
    performReroll,
    startSearch,
    cancelSearch
  };
}