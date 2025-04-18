import { useState, useEffect, useCallback, useMemo } from 'react';
import { SavedVideo, Video, PaginationMetadata } from '@/types';
import useAsync from './useAsync';
import useMounted from './useMounted';
import { useSavedVideosApi } from './useSavedVideosApi';
import { usePagination } from './usePagination';

/**
 * Hook for managing saved videos with pagination
 * Uses the apiClient and useAsync for consistent data fetching patterns
 */
export function useSavedVideos() {
  // Track current page
  const [page, setPage] = useState(1);
  const [limit] = useState(20); // Default limit of 20 items per page

  // Use the centralized useMounted hook for mount state tracking
  const isMounted = useMounted('useSavedVideos');
  
  // Use extracted API hook
  const { 
    fetchSavedVideosAsync, 
    saveVideo: apiSaveVideo, 
    removeVideo: apiRemoveVideo 
  } = useSavedVideosApi(page, limit, isMounted);
  
  // Use the useAsync hook to manage fetch state
  const { 
    data: savedVideosData,
    isLoading, 
    error,
    execute: fetchVideos,
    setData: setSavedVideosData
  } = useAsync<{ videos: SavedVideo[], pagination: PaginationMetadata }>(
    () => fetchSavedVideosAsync(page, limit),
    { 
      immediate: true,
      onSuccess: () => {},
      onError: () => {}
    }
  );
  
  // Refetch when page changes
  useEffect(() => {
    if (isMounted.current) {
      fetchVideos();
    }
  }, [page, fetchVideos, isMounted]);

  // Function to fetch a specific page
  const fetchSavedVideos = useCallback((pageNum: number = page) => {
    if (pageNum !== page) {
      setPage(pageNum);
    } else {
      fetchVideos();
    }
  }, [fetchVideos, page]);

  // Use pagination hook
  const { goToNextPage, goToPrevPage, goToPage } = usePagination(
    page,
    setPage,
    savedVideosData?.pagination
  );

  // Derived state wrapped in useMemo to maintain reference stability
  const savedVideos = useMemo(() => {
    return savedVideosData?.videos || [];
  }, [savedVideosData]);
  
  // Extract pagination data
  const pagination = useMemo(() => {
    return savedVideosData?.pagination || {
      page: 1,
      limit,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    };
  }, [savedVideosData, limit]);

  // Save a video
  const saveVideo = useCallback(async (video: Video) => {
    const result = await apiSaveVideo(video);
    if (result && isMounted.current) {
      await fetchSavedVideos();
    }
    return result;
  }, [apiSaveVideo, fetchSavedVideos, isMounted]);

  // Remove a saved video
  const removeVideo = useCallback(async (videoId: string) => {
    const result = await apiRemoveVideo(videoId);
    
    if (result && isMounted.current && savedVideosData) {
      // Local state update for immediate UI response
      const updatedVideos = savedVideosData.videos.filter(v => v.video_id !== videoId);
      setSavedVideosData({ ...savedVideosData, videos: updatedVideos });
      
      // Refresh the list to ensure server sync
      fetchSavedVideos();
    }
    
    return result;
  }, [apiRemoveVideo, fetchSavedVideos, savedVideosData, setSavedVideosData, isMounted]);

  // Check if a video is already saved
  const isVideoSaved = useCallback((videoId: string) => {
    return savedVideos.some(video => video.video_id === videoId);
  }, [savedVideos]);

  return {
    savedVideos,
    pagination,
    currentPage: page,
    isLoading,
    error: error || null,
    saveVideo,
    removeVideo,
    isVideoSaved,
    refreshSavedVideos: fetchSavedVideos,
    goToNextPage,
    goToPrevPage,
    goToPage
  };
}