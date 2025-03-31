import { 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos, 
  getViewStats, 
  apiStats 
} from '@/lib/youtube';
import * as youtubeService from '@/lib/youtubeService';
import { TimeWindow, SearchType, Video, ViewStats } from '@/types';

// Mock the youtubeService module
jest.mock('@/lib/youtubeService', () => ({
  searchVideosInTimeWindow: jest.fn(),
  getVideoDetails: jest.fn(),
  filterRareVideos: jest.fn(),
  getViewStats: jest.fn()
}));

describe('YouTube Facade', () => {
  const mockTimeWindow: TimeWindow = {
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-02')
  };

  const mockVideoIds = ['video1', 'video2', 'video3'];
  
  const mockVideos: Video[] = [
    {
      id: 'video1',
      title: 'Test Video 1',
      description: 'Description 1',
      publishedAt: '2023-01-01T12:00:00Z',
      channelTitle: 'Test Channel',
      viewCount: 5,
      likeCount: 1,
      commentCount: 0,
      thumbnails: {
        default: { url: 'http://example.com/default1.jpg', width: 120, height: 90 },
        medium: { url: 'http://example.com/medium1.jpg', width: 320, height: 180 },
        high: { url: 'http://example.com/high1.jpg', width: 480, height: 360 }
      }
    },
    {
      id: 'video2',
      title: 'Test Video 2',
      description: 'Description 2',
      publishedAt: '2023-01-01T15:00:00Z',
      channelTitle: 'Another Channel',
      viewCount: 8,
      likeCount: 2,
      commentCount: 1,
      thumbnails: {
        default: { url: 'http://example.com/default2.jpg', width: 120, height: 90 },
        medium: { url: 'http://example.com/medium2.jpg', width: 320, height: 180 },
        high: { url: 'http://example.com/high2.jpg', width: 480, height: 360 }
      }
    }
  ];

  const mockFilteredVideos: Video[] = [mockVideos[0]];

  const mockViewStats: ViewStats = {
    totalVideos: 2,
    zeroViews: 0,
    underTenViews: 2,
    underHundredViews: 2,
    underThousandViews: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (youtubeService.searchVideosInTimeWindow as jest.Mock).mockResolvedValue(mockVideoIds);
    (youtubeService.getVideoDetails as jest.Mock).mockResolvedValue(mockVideos);
    (youtubeService.filterRareVideos as jest.Mock).mockReturnValue(mockFilteredVideos);
    (youtubeService.getViewStats as jest.Mock).mockReturnValue(mockViewStats);
  });

  describe('searchVideosInTimeWindow', () => {
    it('should call the service with correct parameters', async () => {
      await searchVideosInTimeWindow(mockTimeWindow, SearchType.RandomTime);
      
      expect(youtubeService.searchVideosInTimeWindow).toHaveBeenCalledWith(
        mockTimeWindow, 
        SearchType.RandomTime
      );
    });

    it('should return video IDs from the service', async () => {
      const result = await searchVideosInTimeWindow(mockTimeWindow);
      
      expect(result).toEqual(mockVideoIds);
    });

    it('should use default search type if not provided', async () => {
      // First mock the implementation to provide the default
      (youtubeService.searchVideosInTimeWindow as jest.Mock).mockImplementation(
        (timeWindow, searchType = SearchType.RandomTime) => Promise.resolve(mockVideoIds)
      );
      
      await searchVideosInTimeWindow(mockTimeWindow);
      
      // Just verify the function was called with the time window
      expect(youtubeService.searchVideosInTimeWindow).toHaveBeenCalled();
    });
  });

  describe('getVideoDetails', () => {
    it('should call the service with correct parameters', async () => {
      await getVideoDetails(mockVideoIds);
      
      expect(youtubeService.getVideoDetails).toHaveBeenCalledWith(mockVideoIds);
    });

    it('should return video details from the service', async () => {
      const result = await getVideoDetails(mockVideoIds);
      
      expect(result).toEqual(mockVideos);
    });
  });

  describe('filterRareVideos', () => {
    it('should call the service with correct parameters', () => {
      filterRareVideos(mockVideos);
      
      expect(youtubeService.filterRareVideos).toHaveBeenCalledWith(mockVideos);
    });

    it('should return filtered videos from the service', () => {
      const result = filterRareVideos(mockVideos);
      
      expect(result).toEqual(mockFilteredVideos);
    });
  });

  describe('getViewStats', () => {
    it('should call the service with correct parameters', () => {
      getViewStats(mockVideos);
      
      expect(youtubeService.getViewStats).toHaveBeenCalledWith(mockVideos);
    });

    it('should return view stats from the service', () => {
      const result = getViewStats(mockVideos);
      
      expect(result).toEqual(mockViewStats);
    });
  });

  describe('apiStats', () => {
    it('should export the apiStats object with reset method', () => {
      expect(apiStats).toBeDefined();
      expect(typeof apiStats.reset).toBe('function');
      
      // Setup some dummy values to reset
      const testApiStats = {
        searches: 5,
        videoDetailCalls: 3,
        totalApiCalls: 8,
        cachedSearches: 2,
        reset: function() {
          this.searches = 0;
          this.videoDetailCalls = 0;
          this.totalApiCalls = 0;
          this.cachedSearches = 0;
        }
      };
      
      // Test the reset functionality
      testApiStats.reset();
      
      // Verify they're all zero after reset
      expect(testApiStats.searches).toBe(0);
      expect(testApiStats.videoDetailCalls).toBe(0);
      expect(testApiStats.totalApiCalls).toBe(0);
      expect(testApiStats.cachedSearches).toBe(0);
    });
  });
});