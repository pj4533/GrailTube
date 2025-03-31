import { useState } from 'react';
import { Video, TimeWindow, ViewStats, SearchType } from '@/types';
import { apiStats } from '@/lib/youtube';
import { ERROR_MESSAGES } from '@/lib/constants';
import { createErrorHandler } from '@/lib/errorHandlers';

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
  setSearchType: (type: SearchType) => void;
  setKeyword: (keyword: string) => void;
  setIsCancelled: (cancelled: boolean) => void;
  resetState: () => void;
  handleError: (error: any, context: string) => void;
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
  const [searchType, setSearchType] = useState<SearchType>(SearchType.RandomTime);
  const [keyword, setKeyword] = useState<string>('');
  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  
  // Store the abort controller as a closure variable
  let abortController: AbortController | null = null;

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
      keyword,
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
      setSearchType,
      setKeyword,
      setIsCancelled,
      resetState,
      handleError
    },
    createAbortController,
    getAbortController,
    abortCurrentController
  };
}