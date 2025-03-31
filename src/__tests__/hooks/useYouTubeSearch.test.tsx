import { renderHook, act } from '@testing-library/react';
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
    const { result, waitForNextUpdate } = renderHook(() => useYouTubeSearch());
    
    act(() => {
      result.current.startSearch();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(getRandomPastDate).toHaveBeenCalled();
    expect(createInitialTimeWindow).toHaveBeenCalledWith(mockDate);
    expect(searchVideosInTimeWindow).toHaveBeenCalledWith(mockTimeWindow, SearchType.RandomTime);
    expect(getVideoDetails).toHaveBeenCalledWith(mockVideoIds);
    expect(filterRareVideos).toHaveBeenCalledWith(mockVideoDetails);
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.videos).toEqual([
      { id: 'video1', title: 'Video 1', viewCount: 5 },
      { id: 'video2', title: 'Video 2', viewCount: 8 }
    ]);
    expect(result.current.currentWindow).toEqual(mockTimeWindow);
    expect(result.current.statusMessage).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle no videos found in time window', async () => {
    (searchVideosInTimeWindow as jest.Mock).mockResolvedValueOnce([]);
    
    const { result, waitForNextUpdate } = renderHook(() => useYouTubeSearch());
    
    act(() => {
      result.current.startSearch();
    });
    
    await waitForNextUpdate();
    
    // Should try to reroll to a new date
    expect(result.current.statusMessage).toContain('Trying another date');
    expect(delay).toHaveBeenCalled();
  });

  it('should handle no rare videos found', async () => {
    // Mock non-rare videos (all with more than 10 views)
    (filterRareVideos as jest.Mock).mockResolvedValueOnce([]);
    
    const { result, waitForNextUpdate } = renderHook(() => useYouTubeSearch());
    
    act(() => {
      result.current.startSearch();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.statusMessage).toContain('Found');
    expect(delay).toHaveBeenCalled();
  });

  it('should handle YouTube API rate limit error', async () => {
    const rateLimitError = new YouTubeRateLimitError('Quota exceeded');
    (searchVideosInTimeWindow as jest.Mock).mockRejectedValueOnce(rateLimitError);
    
    const { result, waitForNextUpdate } = renderHook(() => useYouTubeSearch());
    
    act(() => {
      result.current.startSearch();
    });
    
    await waitForNextUpdate();
    
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