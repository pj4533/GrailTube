import { useState, useEffect, useCallback } from 'react';
import { SavedVideo, Video } from '@/types';
import { fetchApi, ApiError } from '@/lib/api';

/**
 * Hook for managing saved videos
 * Uses the shared fetchApi utility for consistent error handling
 */
export function useSavedVideos() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all saved videos
  const fetchSavedVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchApi<{ videos: SavedVideo[] }>('/api/saved-videos');
      setSavedVideos(data.videos || []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load saved videos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a video
  const saveVideo = useCallback(async (video: Video) => {
    try {
      await fetchApi('/api/saved-videos', {
        method: 'POST',
        body: JSON.stringify({ video }),
      });
      
      // Refresh the list after saving
      await fetchSavedVideos();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to save video';
      setError(message);
      return false;
    }
  }, [fetchSavedVideos]);

  // Remove a saved video
  const removeVideo = useCallback(async (videoId: string) => {
    try {
      await fetchApi(`/api/saved-videos/${videoId}`, {
        method: 'DELETE',
      });
      
      // Refresh the list after removing
      await fetchSavedVideos();
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to remove video';
      setError(message);
      return false;
    }
  }, [fetchSavedVideos]);

  // Check if a video is already saved
  const isVideoSaved = useCallback((videoId: string) => {
    return savedVideos.some(video => video.video_id === videoId);
  }, [savedVideos]);

  // Initial load
  useEffect(() => {
    fetchSavedVideos();
  }, [fetchSavedVideos]);

  return {
    savedVideos,
    isLoading,
    error,
    saveVideo,
    removeVideo,
    isVideoSaved,
    refreshSavedVideos: fetchSavedVideos
  };
}