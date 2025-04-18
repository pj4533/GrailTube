import { useYouTubeSearchState } from './useYouTubeSearchState';
import { apiStats } from '@/lib/youtube';
import { useSearchOperations } from './useSearchOperations';

/**
 * Custom hook to handle YouTube search for rare videos
 * Coordinates search state and operations
 */
export function useYouTubeSearch() {
  // State management
  const { state, actions, createAbortController, getAbortController, abortCurrentController } = useYouTubeSearchState();
  
  // Destructure state for easier access
  const {
    isLoading, videos, currentWindow, statusMessage, error,
    rerollCount, viewStats, searchType, isCancelled
  } = state;

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