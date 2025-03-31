import { useState, useEffect, useCallback, useMemo } from 'react';
import { SavedVideo, Video } from '@/types';
import apiClient from '@/lib/apiClient';
import useAsync from './useAsync';

/**
 * Hook for managing saved videos
 * Uses the apiClient and useAsync for consistent data fetching patterns
 */
export function useSavedVideos() {
  // Use the useAsync hook to manage fetch state
  const { 
    data: savedVideosData,
    isLoading, 
    error,
    execute: fetchSavedVideos,
    setData: setSavedVideosData
  } = useAsync<{ videos: SavedVideo[] }>(
    async () => {
      const response = await apiClient.get<{ videos: SavedVideo[] }>('/saved-videos');
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || { videos: [] };
    },
    { immediate: true }
  );

  // Derived state wrapped in useMemo to maintain reference stability
  const savedVideos = useMemo(() => {
    return savedVideosData?.videos || [];
  }, [savedVideosData]);

  // Save a video
  const saveVideo = useCallback(async (video: Video) => {
    try {
      const response = await apiClient.post<{ success: boolean }>('/saved-videos', { video });
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Refresh the list after saving
      await fetchSavedVideos();
      return true;
    } catch (error) {
      console.error('Failed to save video:', error);
      return false;
    }
  }, [fetchSavedVideos]);

  // Remove a saved video
  const removeVideo = useCallback(async (videoId: string) => {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/saved-videos/${videoId}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Local state update for immediate UI response
      if (savedVideosData) {
        const updatedVideos = savedVideosData.videos.filter(v => v.video_id !== videoId);
        setSavedVideosData({ ...savedVideosData, videos: updatedVideos });
      }
      
      // Refresh the list to ensure server sync
      fetchSavedVideos();
      return true;
    } catch (error) {
      console.error('Failed to remove video:', error);
      return false;
    }
  }, [fetchSavedVideos, savedVideosData, setSavedVideosData]);

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