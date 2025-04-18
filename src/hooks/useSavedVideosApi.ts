import { useCallback, MutableRefObject } from 'react';
import { SavedVideo, Video, PaginationMetadata } from '@/types';
import apiClient from '@/lib/apiClient';
import logger from '@/lib/logger';

/**
 * Hook to handle API operations for saved videos
 */
export function useSavedVideosApi(
  page: number,
  limit: number,
  isMounted: { current: boolean }
) {
  // Fetch saved videos function
  const fetchSavedVideosAsync = useCallback(async (pageNum: number = page, itemsPerPage: number = limit) => {
    logger.debug('useSavedVideos: Fetching saved videos', { page: pageNum, limit: itemsPerPage });
    
    // Use path without /api prefix since apiClient already adds it
    const response = await apiClient.get<{ 
      videos: SavedVideo[], 
      pagination: PaginationMetadata 
    }>(`/saved-videos?page=${pageNum}&limit=${itemsPerPage}`);
    
    if (response.error) {
      logger.error('useSavedVideos: Error fetching videos', response.error);
      throw new Error(response.error);
    }
    
    logger.debug('useSavedVideos: Fetched videos successfully', { 
      count: response.data?.videos?.length || 0,
      pagination: response.data?.pagination
    });
    
    return response.data || { videos: [], pagination: { 
      page: pageNum, 
      limit: itemsPerPage,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPrevPage: false
    } };
  }, [page, limit]);

  // Save a video API call
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
      
      // Check if component is still mounted
      if (!isMounted.current) {
        logger.debug('useSavedVideos: Component unmounted during saveVideo operation');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('useSavedVideos: Failed to save video', error);
      return false;
    }
  }, [isMounted]);

  // Remove a saved video API call
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
      
      // Check if component is still mounted
      if (!isMounted.current) {
        logger.debug('useSavedVideos: Component unmounted during removeVideo operation');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('useSavedVideos: Failed to remove video', error);
      return false;
    }
  }, [isMounted]);

  return {
    fetchSavedVideosAsync,
    saveVideo,
    removeVideo
  };
}