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
import { useYouTubeSearchState } from '@/hooks/useYouTubeSearchState';
import { 
  getRandomYearMonth,
  getDateFromYearMonth,
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

// Mock useYouTubeSearchState
jest.mock('@/hooks/useYouTubeSearchState', () => ({
  useYouTubeSearchState: jest.fn(() => ({
    state: {
      isLoading: false,
      videos: [],
      currentWindow: null,
      statusMessage: null,
      error: null,
      rerollCount: 0,
      viewStats: null,
      searchType: SearchType.Unedited,
      keyword: "",
      isCancelled: false
    },
    actions: {
      setIsLoading: jest.fn(),
      setVideos: jest.fn(),
      setCurrentWindow: jest.fn(),
      setStatusMessage: jest.fn(),
      setError: jest.fn(),
      setRerollCount: jest.fn(),
      setViewStats: jest.fn(),
      setIsCancelled: jest.fn(),
      resetState: jest.fn(),
      handleError: jest.fn(),
      addSearchedDate: jest.fn(),
      hasSearchedDate: jest.fn(() => false),
      resetSearchedDates: jest.fn(),
      getSearchedDatesCount: jest.fn(() => 0),
      getTotalPossibleDates: jest.fn(() => 100)
    },
    createAbortController: jest.fn(),
    getAbortController: jest.fn(),
    abortCurrentController: jest.fn()
  }))
}));

jest.mock('@/lib/utils', () => ({
  getRandomYearMonth: jest.fn(),
  getDateFromYearMonth: jest.fn(),
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
    endDate: new Date('2023-01-02'),
    durationMinutes: 1440 // 1 day in minutes
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
    (getRandomYearMonth as jest.Mock).mockReturnValue('2023-01');
    (getDateFromYearMonth as jest.Mock).mockReturnValue(mockDate);
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
    expect(result.current.searchType).toBe(SearchType.Unedited);
  });

  it('should have expected interface functions', () => {
    const { result } = renderHook(() => useYouTubeSearch());
    
    // Check that the essential functions exist
    expect(typeof result.current.startSearch).toBe('function');
    expect(typeof result.current.cancelSearch).toBe('function');
    expect(typeof result.current.performReroll).toBe('function');
  });

  it('should expose the searchType from the state', () => {
    const { result } = renderHook(() => useYouTubeSearch());
    
    expect(result.current.searchType).toBe(SearchType.Unedited);
  });
});