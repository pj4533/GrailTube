import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SavedVideo, Video } from '@/types';
import apiClient from '@/lib/apiClient';
import useAsync from './useAsync';
import useMounted from './useMounted';
import logger from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/constants';
import { createErrorHandler } from '@/lib/errorHandlers';

/**
 * Hook for managing saved videos
 * Uses the apiClient and useAsync for consistent data fetching patterns
 */
export function useSavedVideos() {
  // Fetch saved videos function defined outside of useAsync to maintain reference
  const fetchSavedVideosAsync = useCallback(async () => {
    logger.debug('useSavedVideos: Fetching saved videos');
    // Use path without /api prefix since apiClient already adds it
    const response = await apiClient.get<{ videos: SavedVideo[] }>('/saved-videos');
    
    if (response.error) {
      logger.error('useSavedVideos: Error fetching videos', response.error);
      throw new Error(response.error);
    }
    
    logger.debug('useSavedVideos: Fetched videos successfully', { 
      count: response.data?.videos?.length || 0 
    });
    return response.data || { videos: [] };
  }, []);

  // Use the centralized useMounted hook for mount state tracking
  const isMounted = useMounted('useSavedVideos');
  
  // Use the useAsync hook to manage fetch state
  const { 
    data: savedVideosData,
    isLoading, 
    error,
    execute: fetchSavedVideos,
    setData: setSavedVideosData
  } = useAsync<{ videos: SavedVideo[] }>(
    fetchSavedVideosAsync,
    { 
      immediate: true,
      onSuccess: (data) => {
        if (isMounted.current) {
          logger.debug('useSavedVideos: Successfully fetched videos in callback', { 
            count: data?.videos?.length || 0 
          });
        }
      },
      onError: (error) => {
        if (isMounted.current) {
          logger.error('useSavedVideos: Error fetching videos in callback', error);
        }
      }
    }
  );

  // Derived state wrapped in useMemo to maintain reference stability
  const savedVideos = useMemo(() => {
    return savedVideosData?.videos || [];
  }, [savedVideosData]);

  // Save a video
  const saveVideo = useCallback(async (video: Video) => {
    if (!isMounted.current) {
      logger.debug('useSavedVideos: saveVideo called but component is unmounted');
      return false;
    }
    
    try {
      logger.debug('useSavedVideos: Saving video', { videoId: video.id });
      const response = await apiClient.post<{ success: boolean }>('/saved-videos', { video });
      
      if (response.error) {
        logger.error('useSavedVideos: Error from API when saving video', { 
          videoId: video.id, 
          error: response.error 
        });
        throw new Error(response.error);
      }
      
      // Check if component is still mounted before refreshing
      if (!isMounted.current) {
        logger.debug('useSavedVideos: Component unmounted during saveVideo operation');
        return false;
      }
      
      // Refresh the list after saving
      logger.debug('useSavedVideos: Refreshing video list after saving');
      await fetchSavedVideos();
      return true;
    } catch (error) {
      logger.error('useSavedVideos: Failed to save video', error);
      return false;
    }
  }, [fetchSavedVideos, isMounted]);

  // Remove a saved video
  const removeVideo = useCallback(async (videoId: string) => {
    if (!isMounted.current) {
      logger.debug('useSavedVideos: removeVideo called but component is unmounted');
      return false;
    }
    
    try {
      logger.debug('useSavedVideos: Removing video', { videoId });
      const response = await apiClient.delete<{ success: boolean }>(`/saved-videos/${videoId}`);
      
      if (response.error) {
        logger.error('useSavedVideos: Error from API when removing video', { 
          videoId, 
          error: response.error 
        });
        throw new Error(response.error);
      }
      
      // Check if component is still mounted before updating state
      if (!isMounted.current) {
        logger.debug('useSavedVideos: Component unmounted during removeVideo operation');
        return false;
      }
      
      // Local state update for immediate UI response
      if (savedVideosData) {
        const updatedVideos = savedVideosData.videos.filter(v => v.video_id !== videoId);
        logger.debug('useSavedVideos: Updating local state after removing video', { 
          videoId, 
          newCount: updatedVideos.length 
        });
        setSavedVideosData({ ...savedVideosData, videos: updatedVideos });
      }
      
      // Refresh the list to ensure server sync
      // Only if we're still mounted
      if (isMounted.current) {
        logger.debug('useSavedVideos: Refreshing video list after removal');
        fetchSavedVideos();
      }
      
      return true;
    } catch (error) {
      logger.error('useSavedVideos: Failed to remove video', error);
      return false;
    }
  }, [fetchSavedVideos, savedVideosData, setSavedVideosData, isMounted]);

  // Check if a video is already saved
  const isVideoSaved = useCallback((videoId: string) => {
    return savedVideos.some(video => video.video_id === videoId);
  }, [savedVideos]);

  return {
    savedVideos,
    isLoading,
    error: error || null,
    saveVideo,
    removeVideo,
    isVideoSaved,
    refreshSavedVideos: fetchSavedVideos
  };
}