import axios from 'axios';
import { 
  getLargeTimeWindow, 
  performYouTubeSearch,
  getCombinedCameraPatterns,
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
  describe('getCombinedCameraPatterns', () => {
    it('should combine camera patterns with OR operator', () => {
      const result = getCombinedCameraPatterns();
      // Should include all camera patterns
      expect(result).toBe('IMG_|DSC_|DCIM|MOV_|VID_|MVI_');
      
      // Verify it contains these specific patterns
      expect(result.includes('IMG_')).toBe(true);
      expect(result.includes('DSC_')).toBe(true);
      expect(result.includes('DCIM')).toBe(true);
      expect(result.includes('MOV_')).toBe(true);
      expect(result.includes('VID_')).toBe(true);
      expect(result.includes('MVI_')).toBe(true);
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
      const query = (axios.get as jest.Mock).mock.calls[0][1].params.q;
      
      // Should contain the camera patterns
      expect(query).toBe('IMG_|DSC_|DCIM|MOV_|VID_|MVI_');
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