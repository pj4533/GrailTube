import { useState, useEffect, useCallback } from 'react';
import { SavedVideo, Video } from '@/types';

export function useSavedVideos() {
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all saved videos
  const fetchSavedVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/saved-videos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch saved videos');
      }
      
      const data = await response.json();
      setSavedVideos(data.videos || []);
    } catch (err) {
      console.error('Error fetching saved videos:', err);
      setError('Failed to load saved videos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save a video
  const saveVideo = useCallback(async (video: Video) => {
    try {
      const response = await fetch('/api/saved-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ video }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save video');
      }
      
      // Refresh the list after saving
      await fetchSavedVideos();
      return true;
    } catch (err: any) {
      console.error('Error saving video:', err);
      setError(err.message || 'Failed to save video');
      return false;
    }
  }, [fetchSavedVideos]);

  // Remove a saved video
  const removeVideo = useCallback(async (videoId: string) => {
    try {
      const response = await fetch(`/api/saved-videos/${videoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove video');
      }
      
      // Refresh the list after removing
      await fetchSavedVideos();
      return true;
    } catch (err) {
      console.error('Error removing video:', err);
      setError('Failed to remove video');
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