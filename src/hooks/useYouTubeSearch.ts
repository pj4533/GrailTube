import React, { useEffect } from 'react';
import { useYouTubeSearchState } from './useYouTubeSearchState';
import { apiStats } from '@/lib/youtube';
import { setApiKey } from '@/lib/youtubeService';
import { useSearchOperations } from './useSearchOperations';
import useYouTubeApiKey from './useYouTubeApiKey';

/**
 * Custom hook to handle YouTube search for rare videos
 * Coordinates search state and operations
 */
export function useYouTubeSearch() {
  // State management
  const { state, actions, createAbortController, getAbortController, abortCurrentController } = useYouTubeSearchState();
  const { apiKey, isLoaded } = useYouTubeApiKey();
  
  // Destructure state for easier access
  const {
    isLoading, videos, currentWindow, statusMessage, error,
    rerollCount, viewStats, searchType, isCancelled
  } = state;
  
  // Set the API key when it changes
  useEffect(() => {
    if (isLoaded) {
      const envApiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
      const keyToUse = apiKey || envApiKey;
      setApiKey(keyToUse);
    }
  }, [apiKey, isLoaded]);

  // Use search operations hook for core functionality
  const { performSearch, performReroll, startSearch, cancelSearch } = useSearchOperations(
    state,
    actions,
    createAbortController,
    abortCurrentController
  );

  // Return hook interface
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