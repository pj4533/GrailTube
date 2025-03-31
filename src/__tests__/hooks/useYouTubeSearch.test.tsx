import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { SearchType } from '@/types';
import { 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos, 
  getViewStats,
  apiStats,
  YouTubeRateLimitError
} from '@/lib/youtube';
import { 
  getRandomPastDate, 
  createInitialTimeWindow,
  delay
} from '@/lib/utils';

// Mock all dependencies
jest.mock('@/lib/youtube', () => ({
  searchVideosInTimeWindow: jest.fn(),
  getVideoDetails: jest.fn(),
  filterRareVideos: jest.fn(),
  getViewStats: jest.fn(),
  apiStats: {
    reset: jest.fn(),
    searches: 0,
    videoDetailCalls: 0,
    totalApiCalls: 0
  },
  YouTubeRateLimitError: class YouTubeRateLimitError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'YouTubeRateLimitError';
    }
  }
}));

jest.mock('@/lib/utils', () => ({
  getRandomPastDate: jest.fn(),
  createInitialTimeWindow: jest.fn(),
  delay: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn()
}));

describe('useYouTubeSearch Hook', () => {
  const mockDate = new Date('2023-01-01');
  const mockTimeWindow = {
    startDate: mockDate,
    endDate: new Date('2023-01-02')
  };
  
  // Mock video data
  const mockVideoIds = ['video1', 'video2', 'video3'];
  const mockVideoDetails = [
    { id: 'video1', title: 'Video 1', viewCount: 5 },
    { id: 'video2', title: 'Video 2', viewCount: 8 },
    { id: 'video3', title: 'Video 3', viewCount: 20 }
  ];
  const mockRareVideos = [
    { id: 'video1', title: 'Video 1', viewCount: 5 },
    { id: 'video2', title: 'Video 2', viewCount: 8 }
  ];
  const mockViewStats = {
    totalVideos: 3,
    zeroViews: 0,
    underTenViews: 2,
    underHundredViews: 3,
    underThousandViews: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (getRandomPastDate as jest.Mock).mockReturnValue(mockDate);
    (createInitialTimeWindow as jest.Mock).mockReturnValue(mockTimeWindow);
    (searchVideosInTimeWindow as jest.Mock).mockResolvedValue(mockVideoIds);
    (getVideoDetails as jest.Mock).mockResolvedValue(mockVideoDetails);
    (filterRareVideos as jest.Mock).mockReturnValue(mockRareVideos);
    (getViewStats as jest.Mock).mockReturnValue(mockViewStats);
    (delay as jest.Mock).mockResolvedValue(undefined);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useYouTubeSearch());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.videos).toEqual([]);
    expect(result.current.currentWindow).toBeNull();
    expect(result.current.statusMessage).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.searchType).toBe(SearchType.RandomTime);
  });

  it('should search and find videos with less than 10 views', async () => {
    const { result } = renderHook(() => useYouTubeSearch());
    
    // Wrap state updates in act
    await act(async () => {
      result.current.startSearch();
    });
    
    // Wait for all async operations to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.videos).toHaveLength(2);
    });
    
    expect(getRandomPastDate).toHaveBeenCalled();
    expect(createInitialTimeWindow).toHaveBeenCalledWith(mockDate, false, SearchType.RandomTime);
    expect(searchVideosInTimeWindow).toHaveBeenCalledWith(mockTimeWindow, SearchType.RandomTime, undefined);
    expect(getVideoDetails).toHaveBeenCalledWith(mockVideoIds);
    expect(filterRareVideos).toHaveBeenCalledWith(mockVideoDetails);
    
    expect(result.current.videos).toEqual([
      { id: 'video1', title: 'Video 1', viewCount: 5 },
      { id: 'video2', title: 'Video 2', viewCount: 8 }
    ]);
    expect(result.current.currentWindow).toEqual(mockTimeWindow);
    expect(result.current.statusMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle no videos found in time window', async () => {
    // Mock searchVideosInTimeWindow to return empty array
    (searchVideosInTimeWindow as jest.Mock).mockResolvedValueOnce([]);
    
    const { result } = renderHook(() => useYouTubeSearch());
    
    await act(async () => {
      result.current.startSearch();
    });
    
    // Wait for the status message to change
    await waitFor(() => {
      expect(result.current.statusMessage).toBeDefined();
    });
    
    expect(delay).toHaveBeenCalled();
    expect(searchVideosInTimeWindow).toHaveBeenCalled();
  });

  it('should handle no rare videos found', async () => {
    // Mock filterRareVideos to return empty array
    (filterRareVideos as jest.Mock).mockReturnValueOnce([]);
    
    const { result } = renderHook(() => useYouTubeSearch());
    
    await act(async () => {
      result.current.startSearch();
    });
    
    // Wait for the status message to update
    await waitFor(() => {
      expect(result.current.statusMessage).toBeDefined();
    });
    
    expect(delay).toHaveBeenCalled();
    expect(filterRareVideos).toHaveBeenCalled();
  });

  it('should handle YouTube API rate limit error', async () => {
    const rateLimitError = new YouTubeRateLimitError('Quota exceeded');
    (searchVideosInTimeWindow as jest.Mock).mockRejectedValueOnce(rateLimitError);
    
    const { result } = renderHook(() => useYouTubeSearch());
    
    await act(async () => {
      result.current.startSearch();
    });
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toContain('YouTube API rate limit reached');
  });

  it('should change search type', () => {
    const { result } = renderHook(() => useYouTubeSearch());
    
    act(() => {
      result.current.changeSearchType(SearchType.Unedited);
    });
    
    expect(result.current.searchType).toBe(SearchType.Unedited);
    expect(result.current.videos).toEqual([]);
  });
});