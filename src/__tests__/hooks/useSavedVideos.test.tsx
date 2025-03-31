import { renderHook, act, waitFor } from '@testing-library/react';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import apiClient from '@/lib/apiClient';
import logger from '@/lib/logger';
import useAsync from '@/hooks/useAsync';

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

// Mock useAsync hook
jest.mock('@/hooks/useAsync', () => {
  return jest.fn().mockImplementation((fn, options = {}) => {
    const mockAsyncState = {
      data: { videos: [] },
      isLoading: false,
      error: "",
      execute: jest.fn().mockImplementation(async () => {
        try {
          const result = await fn();
          mockAsyncState.data = result;
          options?.onSuccess?.(result);
          return result;
        } catch (err) {
          mockAsyncState.error = err instanceof Error ? err.message : String(err);
          options?.onError?.(err);
          throw err;
        }
      }),
      reset: jest.fn(),
      setData: jest.fn().mockImplementation((newData) => {
        mockAsyncState.data = newData;
      }),
      setError: jest.fn(),
      setLoading: jest.fn()
    };

    // Execute immediately if specified
    if (options?.immediate) {
      mockAsyncState.execute();
    }

    return mockAsyncState;
  });
});

describe('useSavedVideos Hook', () => {
  // Mock data
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

  const mockVideo = {
    id: 'video3',
    title: 'Test Video 3',
    description: 'Description 3',
    thumbnailUrl: 'https://example.com/thumb3.jpg',
    channelTitle: 'Channel 3',
    publishedAt: '2023-01-03T00:00:00Z',
    viewCount: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation for successful API responses
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: { videos: mockSavedVideos },
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

  it('fetches saved videos on mount', async () => {
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: { videos: mockSavedVideos },
      isLoading: false,
      error: "",
      execute: jest.fn(),
      reset: jest.fn(),
      setData: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    // Should have videos immediately due to our mock
    expect(result.current.savedVideos).toEqual(mockSavedVideos);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles API error when fetching saved videos', async () => {
    const errorMessage = 'Failed to fetch saved videos';
    
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: null,
      isLoading: false,
      error: errorMessage,
      execute: jest.fn(),
      reset: jest.fn(),
      setData: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.savedVideos).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('saves a video successfully', async () => {
    // Mock successful API calls
    const executeAsync = jest.fn().mockResolvedValue({ videos: mockSavedVideos });
    
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: { videos: mockSavedVideos },
      isLoading: false,
      error: "",
      execute: executeAsync,
      reset: jest.fn(),
      setData: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    // Call saveVideo and wait for it to complete
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveVideo(mockVideo);
    });
    
    expect(saveResult).toBe(true);
    expect(apiClient.post).toHaveBeenCalledWith('/saved-videos', { video: mockVideo });
    expect(executeAsync).toHaveBeenCalled(); // Should refresh the list
  });

  it('handles error when saving a video', async () => {
    const errorMessage = 'Failed to save video';
    (apiClient.post as jest.Mock).mockResolvedValueOnce({
      data: null,
      error: errorMessage
    });
    
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: { videos: mockSavedVideos },
      isLoading: false,
      error: "",
      execute: jest.fn(),
      reset: jest.fn(),
      setData: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    // Try to save a video that will fail
    let saveResult;
    await act(async () => {
      saveResult = await result.current.saveVideo(mockVideo);
    });
    
    expect(saveResult).toBe(false);
    expect(apiClient.post).toHaveBeenCalledWith('/saved-videos', { video: mockVideo });
    expect(logger.error).toHaveBeenCalled();
  });

  it('removes a video successfully', async () => {
    // Setup mock with implementation for setSavedVideosData
    const executeAsync = jest.fn().mockResolvedValue({ videos: mockSavedVideos.slice(1) }); // Return videos except the first one
    const setDataMock = jest.fn();
    
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: { videos: mockSavedVideos },
      isLoading: false,
      error: "",
      execute: executeAsync,
      reset: jest.fn(),
      setData: setDataMock,
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    // Remove a video
    const videoIdToRemove = 'video1';
    let removeResult;
    await act(async () => {
      removeResult = await result.current.removeVideo(videoIdToRemove);
    });
    
    expect(removeResult).toBe(true);
    expect(apiClient.delete).toHaveBeenCalledWith(`/saved-videos/${videoIdToRemove}`);
    expect(setDataMock).toHaveBeenCalled(); // Should update local state
    expect(executeAsync).toHaveBeenCalled(); // Should refresh from server
  });

  it('checks if a video is saved correctly', async () => {
    (useAsync as jest.Mock).mockImplementationOnce(() => ({
      data: { videos: mockSavedVideos },
      isLoading: false,
      error: "",
      execute: jest.fn(),
      reset: jest.fn(),
      setData: jest.fn(),
      setError: jest.fn(),
      setLoading: jest.fn()
    }));
    
    const { result } = renderHook(() => useSavedVideos());
    
    // Check a video that is saved
    expect(result.current.isVideoSaved('video1')).toBe(true);
    
    // Check a video that is not saved
    expect(result.current.isVideoSaved('nonexistent')).toBe(false);
  });
});