import { useState, useEffect } from 'react';
import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { apiStats } from '@/lib/youtube';
import { ERROR_MESSAGES } from '@/lib/constants';
import { createErrorHandler } from '@/lib/errorHandlers';
import { useSearchedDates } from './useSearchedDates';
import { useAbortController } from './useAbortController';

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
  
  // Use extracted hooks
  const { 
    searchedDates,
    addSearchedDate,
    hasSearchedDate,
    resetSearchedDates,
    getSearchedDatesCount,
    getTotalPossibleDates
  } = useSearchedDates();
  
  const {
    createAbortController,
    getAbortController,
    abortCurrentController
  } = useAbortController();

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
    createAbortController();
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