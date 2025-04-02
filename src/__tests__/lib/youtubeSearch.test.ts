import axios from 'axios';
import { 
  getSearchCacheKey, 
  getLargeTimeWindow, 
  performYouTubeSearch,
  getSearchQuery,
  getRandomSearchTerm,
  getCombinedCameraPatterns,
  searchTerms,
  cameraFilenamePatterns
} from '@/lib/youtubeSearch';
import { SearchType, TimeWindow } from '@/types';
import { YouTubeRateLimitError, handleYouTubeApiError } from '@/lib/youtubeTypes';

// Mock axios
jest.mock('axios');

// Mock youtubeTypes module
jest.mock('@/lib/youtubeTypes', () => ({
  ...jest.requireActual('@/lib/youtubeTypes'),
  handleYouTubeApiError: jest.fn()
}));

describe('YouTube Search', () => {
  describe('getSearchQuery', () => {
    it('should always return combined camera patterns', () => {
      const result = getSearchQuery(SearchType.Unedited);
      expect(result).toBe(getCombinedCameraPatterns());
      // Verify it contains pipe-separated camera patterns
      expect(result.includes('|')).toBe(true);
    });
    
    it('should ignore keyword parameter', () => {
      const keyword = 'test keyword';
      const result = getSearchQuery(SearchType.Unedited, keyword);
      expect(result).toBe(getCombinedCameraPatterns());
    });
  });

  describe('getRandomSearchTerm', () => {
    it('should return a term from the search terms array', () => {
      const result = getRandomSearchTerm();
      expect(searchTerms).toContain(result);
    });
  });

  describe('getCombinedCameraPatterns', () => {
    it('should combine all camera patterns with OR operator', () => {
      const result = getCombinedCameraPatterns();
      // Should join all patterns with pipe character
      expect(result).toBe(cameraFilenamePatterns.join('|'));
      
      // Verify it contains all patterns
      cameraFilenamePatterns.forEach(pattern => {
        expect(result.includes(pattern)).toBe(true);
      });
    });
  });

  describe('getSearchCacheKey', () => {
    it('should generate cache key with time window and search type', () => {
      const timeWindow: TimeWindow = {
        startDate: new Date('2023-01-01T00:00:00Z'),
        endDate: new Date('2023-01-02T00:00:00Z'),
        durationMinutes: 1440 // 24 hours
      };
      
      const key = getSearchCacheKey(timeWindow, SearchType.Unedited);
      
      expect(key).toBe('unedited_2023-01-01T00:00:00.000Z_2023-01-02T00:00:00.000Z');
    });
  });

  describe('getLargeTimeWindow', () => {
    it('should double the time window duration', () => {
      const timeWindow: TimeWindow = {
        startDate: new Date('2023-01-01T12:00:00Z'),
        endDate: new Date('2023-01-02T12:00:00Z'),
        durationMinutes: 1440 // 24 hours
      };
      
      const expandedWindow = getLargeTimeWindow(timeWindow);
      
      // Original window shouldn't be modified
      expect(timeWindow.endDate).toEqual(new Date('2023-01-02T12:00:00Z'));
      
      // New window should be centered on the original window with 2x duration
      expect(expandedWindow.durationMinutes).toBe(2880); // 48 hours
      
      // Check that the center time is preserved
      const centerTime = new Date((timeWindow.startDate.getTime() + timeWindow.endDate.getTime()) / 2);
      const expandedCenterTime = new Date((expandedWindow.startDate.getTime() + expandedWindow.endDate.getTime()) / 2);
      expect(expandedCenterTime.toISOString()).toBe(centerTime.toISOString());
    });

    it('should create a new object not modifying the original', () => {
      const timeWindow: TimeWindow = {
        startDate: new Date('2023-01-01T00:00:00Z'),
        endDate: new Date('2023-01-02T00:00:00Z'),
        durationMinutes: 1440
      };
      
      const expandedWindow = getLargeTimeWindow(timeWindow);
      
      // Should be a new object
      expect(expandedWindow).not.toBe(timeWindow);
    });
  });

  describe('performYouTubeSearch', () => {
    const apiKey = 'test-api-key';
    const timeWindow: TimeWindow = {
      startDate: new Date('2023-01-01T00:00:00Z'),
      endDate: new Date('2023-01-02T00:00:00Z'),
      durationMinutes: 1440
    };
    
    const mockSearchResponse = {
      data: {
        items: [
          { id: { videoId: 'video1' } },
          { id: { videoId: 'video2' } },
          { id: { videoId: 'video3' } }
        ]
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (axios.get as jest.Mock).mockResolvedValue(mockSearchResponse);
      (handleYouTubeApiError as jest.Mock).mockImplementation((error) => {
        throw error;
      });
      
      // Mock the search query function to return predictable values for testing
      jest.mock('@/lib/youtubeSearch', () => ({
        ...jest.requireActual('@/lib/youtubeSearch'),
        getSearchQuery: (searchType: SearchType) => {
          return 'IMG_|DSC_';
        }
      }));
    });

    it('should call YouTube API with correct parameters', async () => {
      await performYouTubeSearch(apiKey, timeWindow, SearchType.Unedited, 50);
      
      // Verify that axios.get was called with the YouTube API URL
      expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/youtube/v3/search', expect.anything());
      
      // Extract the actual parameters that were passed
      const callParams = (axios.get as jest.Mock).mock.calls[0][1].params;
      
      // Verify the common parameters we expect
      expect(callParams.part).toBe('snippet');
      expect(callParams.type).toBe('video');
      expect(callParams.maxResults).toBe(50);
      expect(callParams.key).toBe(apiKey);
      expect(callParams.publishedAfter).toBe('2023-01-01T00:00:00.000Z');
      expect(callParams.publishedBefore).toBe('2023-01-02T00:00:00.000Z');
      
      // Verify that we have a search query, but don't check its exact value
      expect(typeof callParams.q).toBe('string');
    });

    it('should use the camera patterns for search', async () => {
      await performYouTubeSearch(apiKey, timeWindow, SearchType.Unedited, 50);
      const uneditedQuery = (axios.get as jest.Mock).mock.calls[0][1].params.q;
      
      // Should contain the camera patterns
      expect(uneditedQuery).toBe('IMG_|DSC_');
    });

    it('should extract and return video IDs from response', async () => {
      const videoIds = await performYouTubeSearch(apiKey, timeWindow, SearchType.Unedited, 50);
      
      expect(videoIds).toEqual(['video1', 'video2', 'video3']);
    });

    it('should handle empty response', async () => {
      (axios.get as jest.Mock).mockResolvedValue({ data: { items: [] } });
      
      const videoIds = await performYouTubeSearch(apiKey, timeWindow, SearchType.Unedited, 50);
      
      expect(videoIds).toEqual([]);
    });

    it('should handle API errors properly', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);
      (handleYouTubeApiError as jest.Mock).mockReturnValue([]);
      
      await performYouTubeSearch(apiKey, timeWindow, SearchType.Unedited, 50);
      
      expect(handleYouTubeApiError).toHaveBeenCalledWith(error, 'video search');
    });
  });
});