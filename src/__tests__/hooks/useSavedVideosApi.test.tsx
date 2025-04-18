import { renderHook, act } from '@testing-library/react';
import { useSavedVideosApi } from '@/hooks/useSavedVideosApi';
import apiClient from '@/lib/apiClient';
import logger from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  }
}));

// Mock logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
}));

describe('useSavedVideosApi Hook', () => {
  // Mock data
  const mockVideo = {
    id: 'video1',
    title: 'Test Video 1',
    description: 'Description 1',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    channelTitle: 'Channel 1',
    publishedAt: '2023-01-01T00:00:00Z',
    viewCount: 5
  };

  const mockSavedVideos = [
    {
      id: 1,
      video_id: 'video1',
      title: 'Test Video 1',
      description: 'Description 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      channelTitle: 'Channel 1',
      publishedAt: '2023-01-01T00:00:00Z',
      view_count_at_discovery: 5,
      discovered_at: '2023-01-15T00:00:00Z',
      duration: 'PT2M30S'
    },
    {
      id: 2,
      video_id: 'video2',
      title: 'Test Video 2',
      description: 'Description 2',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      channelTitle: 'Channel 2',
      publishedAt: '2023-01-02T00:00:00Z',
      view_count_at_discovery: 8,
      discovered_at: '2023-01-16T00:00:00Z',
      duration: 'PT3M45S'
    }
  ];

  const mockPagination = {
    page: 1,
    limit: 20,
    totalCount: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations for successful API responses
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { 
        videos: mockSavedVideos,
        pagination: mockPagination
      },
      error: null
    });
    
    (apiClient.post as jest.Mock).mockResolvedValue({
      data: { success: true },
      error: null
    });
    
    (apiClient.delete as jest.Mock).mockResolvedValue({
      data: { success: true },
      error: null
    });
  });

  it('fetches saved videos successfully', async () => {
    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.fetchSavedVideosAsync();
    
    expect(response).toEqual({
      videos: mockSavedVideos,
      pagination: mockPagination
    });
    expect(apiClient.get).toHaveBeenCalledWith('/saved-videos?page=1&limit=20');
    expect(logger.debug).toHaveBeenCalled();
  });

  it('handles error when fetching saved videos', async () => {
    const errorMessage = 'Failed to fetch saved videos';
    (apiClient.get as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: errorMessage
    });

    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    await expect(result.current.fetchSavedVideosAsync()).rejects.toThrow(errorMessage);
    expect(logger.error).toHaveBeenCalled();
  });

  it('can fetch videos with custom page and limit', async () => {
    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    await result.current.fetchSavedVideosAsync(2, 10);
    
    expect(apiClient.get).toHaveBeenCalledWith('/saved-videos?page=2&limit=10');
  });

  it('saves a video successfully', async () => {
    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.saveVideo(mockVideo);
    
    expect(response).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/saved-videos', { video: mockVideo });
  });

  it('returns false when saveVideo is called after component unmounts', async () => {
    const isMounted = { current: true };
    const { result } = renderHook(() => useSavedVideosApi(1, 20, isMounted));
    
    // Simulate component unmounting
    isMounted.current = false;
    
    const response = await result.current.saveVideo(mockVideo);
    
    expect(response).toBe(false);
    expect(apiClient.post).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('returns false if component unmounts during saveVideo operation', async () => {
    // Create a version of post that takes time to resolve
    const isMounted = { current: true };
    (apiClient.post as jest.Mock).mockImplementationOnce(async () => {
      // Set isMounted to false midway through the operation
      isMounted.current = false;
      return {
        data: { success: true },
        error: null
      };
    });

    const { result } = renderHook(() => useSavedVideosApi(1, 20, isMounted));
    
    const response = await result.current.saveVideo(mockVideo);
    
    expect(response).toBe(false);
    expect(apiClient.post).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('handles API error when saving a video', async () => {
    const errorMessage = 'Failed to save video';
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: errorMessage
    });

    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.saveVideo(mockVideo);
    
    expect(response).toBe(false);
    expect(apiClient.post).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('handles unexpected exceptions when saving a video', async () => {
    (apiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.saveVideo(mockVideo);
    
    expect(response).toBe(false);
    expect(apiClient.post).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('removes a video successfully', async () => {
    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.removeVideo('video1');
    
    expect(response).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith('/saved-videos/video1');
  });

  it('returns false when removeVideo is called after component unmounts', async () => {
    const isMounted = { current: true };
    const { result } = renderHook(() => useSavedVideosApi(1, 20, isMounted));
    
    // Simulate component unmounting
    isMounted.current = false;
    
    const response = await result.current.removeVideo('video1');
    
    expect(response).toBe(false);
    expect(apiClient.delete).not.toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('returns false if component unmounts during removeVideo operation', async () => {
    // Create a version of delete that takes time to resolve
    const isMounted = { current: true };
    (apiClient.delete as jest.Mock).mockImplementationOnce(async () => {
      // Set isMounted to false midway through the operation
      isMounted.current = false;
      return {
        data: { success: true },
        error: null
      };
    });

    const { result } = renderHook(() => useSavedVideosApi(1, 20, isMounted));
    
    const response = await result.current.removeVideo('video1');
    
    expect(response).toBe(false);
    expect(apiClient.delete).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalled();
  });

  it('handles API error when removing a video', async () => {
    const errorMessage = 'Failed to remove video';
    (apiClient.delete as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: errorMessage
    });

    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.removeVideo('video1');
    
    expect(response).toBe(false);
    expect(apiClient.delete).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it('handles unexpected exceptions when removing a video', async () => {
    (apiClient.delete as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useSavedVideosApi(1, 20, { current: true }));
    
    const response = await result.current.removeVideo('video1');
    
    expect(response).toBe(false);
    expect(apiClient.delete).toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });
});