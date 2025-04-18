import { useState, useEffect } from 'react';
import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { apiStats } from '@/lib/youtube';
import { ERROR_MESSAGES } from '@/lib/constants';
import { createErrorHandler } from '@/lib/errorHandlers';

// Local storage key for searched year/month combinations
const SEARCHED_DATES_KEY = 'grailtube_searched_dates';

export interface SearchState {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
  rerollCount: number;
  viewStats: ViewStats | null;
  searchType: SearchType;
  keyword: string;
  isCancelled: boolean;
}

export interface SearchStateActions {
  setIsLoading: (loading: boolean) => void;
  setVideos: (videos: Video[]) => void;
  setCurrentWindow: (window: TimeWindow | null) => void;
  setStatusMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  setRerollCount: (count: number) => void;
  setViewStats: (stats: ViewStats | null) => void;
  setIsCancelled: (cancelled: boolean) => void;
  resetState: () => void;
  handleError: (error: any, context: string) => void;
  addSearchedDate: (yearMonth: string) => void;
  hasSearchedDate: (yearMonth: string) => boolean;
  resetSearchedDates: () => void;
  getSearchedDatesCount: () => number;
  getTotalPossibleDates: () => number;
}

/**
 * Creates and manages state for the YouTube search hook
 */
export function useYouTubeSearchState(): {
  state: SearchState;
  actions: SearchStateActions;
  createAbortController: () => AbortController;
  getAbortController: () => AbortController | null;
  abortCurrentController: () => void;
} {
  // State variables
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentWindow, setCurrentWindow] = useState<TimeWindow | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rerollCount, setRerollCount] = useState<number>(0);
  const [viewStats, setViewStats] = useState<ViewStats | null>(null);
  // Always Unedited search type
  const [searchType] = useState<SearchType>(SearchType.Unedited);
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  
  // Store the abort controller as a closure variable
  let abortController: AbortController | null = null;
  
  // Track searched year/month combinations in state
  const [searchedDates, setSearchedDates] = useState<Set<string>>(new Set());
  
  // Load searched dates from localStorage on component mount
  useEffect(() => {
    try {
      const savedDates = localStorage.getItem(SEARCHED_DATES_KEY);
      if (savedDates) {
        setSearchedDates(new Set(JSON.parse(savedDates)));
      }
    } catch (error) {
      console.error('Error loading searched dates from localStorage:', error);
      // If there's an error, we'll start with an empty set
    }
  }, []);
  
  // Save searched dates to localStorage whenever it changes
  useEffect(() => {
    if (searchedDates.size > 0) {
      try {
        // Convert Set to Array before stringifying
        const searchedDatesArray = Array.from(searchedDates);
        localStorage.setItem(SEARCHED_DATES_KEY, JSON.stringify(searchedDatesArray));
      } catch (error) {
        console.error('Error saving searched dates to localStorage:', error);
      }
    }
  }, [searchedDates]);

  /**
   * Create a reusable error handler for this hook
   */
  const handleError = createErrorHandler({
    setError,
    setLoading: setIsLoading,
    customMessages: {
      rateLimit: ERROR_MESSAGES.RATE_LIMIT,
      default: ERROR_MESSAGES.DEFAULT
    }
  });

  /**
   * Reset all state to initial values
   */
  const resetState = () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setRerollCount(0);
    setIsCancelled(false);
    
    // Reset API call stats
    apiStats.reset();
    
    // Create a new abort controller for this search
    abortController = new AbortController();
  };
  
  /**
   * Add a year-month combination to the set of searched dates
   */
  const addSearchedDate = (yearMonth: string): void => {
    setSearchedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(yearMonth);
      return newSet;
    });
  };
  
  /**
   * Check if a year-month combination has already been searched
   */
  const hasSearchedDate = (yearMonth: string): boolean => {
    return searchedDates.has(yearMonth);
  };
  
  /**
   * Reset the set of searched dates
   */
  const resetSearchedDates = (): void => {
    setSearchedDates(new Set());
    try {
      localStorage.removeItem(SEARCHED_DATES_KEY);
    } catch (error) {
      console.error('Error clearing searched dates from localStorage:', error);
    }
  };
  
  /**
   * Get the number of searched dates
   */
  const getSearchedDatesCount = (): number => {
    return searchedDates.size;
  };
  
  /**
   * Get the total number of possible year-month combinations
   * from YouTube's founding (April 2005) to current date
   */
  const getTotalPossibleDates = (): number => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // YouTube founding date: April 2005
    const startYear = 2005;
    const startMonth = 3; // April is month 3 (0-indexed)
    
    // Calculate total months: (years * 12 + months) - (startYear * 12 + startMonth)
    return (currentYear * 12 + currentMonth) - (startYear * 12 + startMonth) + 1;
  };
  
  /**
   * Create a new abort controller
   */
  const createAbortController = (): AbortController => {
    abortController = new AbortController();
    return abortController;
  };
  
  /**
   * Get the current abort controller
   */
  const getAbortController = (): AbortController | null => {
    return abortController;
  };
  
  /**
   * Abort the current controller if it exists
   */
  const abortCurrentController = (): void => {
    if (abortController) {
      abortController.abort();
    }
  };

  return {
    state: {
      isLoading,
      videos,
      currentWindow,
      statusMessage,
      error,
      rerollCount,
      viewStats,
      searchType,
      keyword: "", // Not used anymore, but kept for API compatibility
      isCancelled
    },
    actions: {
      setIsLoading,
      setVideos,
      setCurrentWindow,
      setStatusMessage,
      setError,
      setRerollCount,
      setViewStats,
      setIsCancelled,
      resetState,
      handleError,
      addSearchedDate,
      hasSearchedDate,
      resetSearchedDates,
      getSearchedDatesCount,
      getTotalPossibleDates
    },
    createAbortController,
    getAbortController,
    abortCurrentController
  };
}