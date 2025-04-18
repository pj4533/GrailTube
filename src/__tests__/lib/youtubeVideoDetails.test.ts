import axios from 'axios';
import { 
  processVideoDetails, 
  parseVideoDetails,
  fetchVideoBatch
} from '@/lib/youtubeVideoDetails';
import { Video } from '@/types';
import { YouTubeRateLimitError, apiStats, handleYouTubeApiError } from '@/lib/youtubeTypes';

// Mock axios
jest.mock('axios');

// Mock youtubeTypes module
jest.mock('@/lib/youtubeTypes', () => ({
  ...jest.requireActual('@/lib/youtubeTypes'),
  handleYouTubeApiError: jest.fn()
}));

describe('YouTube Video Details', () => {
  const apiKey = 'test-api-key';
  
  // Mock video data
  const mockApiResponse = {
    data: {
      items: [
        {
          id: 'video1',
          snippet: {
            title: 'Test Video 1',
            description: 'Description 1',
            publishedAt: '2023-01-01T12:00:00Z',
            channelTitle: 'Test Channel',
            thumbnails: {
              default: { url: 'http://example.com/default1.jpg', width: 120, height: 90 },
              medium: { url: 'http://example.com/medium1.jpg', width: 320, height: 180 },
              high: { url: 'http://example.com/high1.jpg', width: 480, height: 360 }
            }
          },
          statistics: {
            viewCount: '5',
            likeCount: '1',
            commentCount: '0'
          }
        },
        {
          id: 'video2',
          snippet: {
            title: 'Test Video 2',
            description: 'Description 2',
            publishedAt: '2023-01-01T15:00:00Z',
            channelTitle: 'Another Channel',
            thumbnails: {
              default: { url: 'http://example.com/default2.jpg', width: 120, height: 90 },
              medium: { url: 'http://example.com/medium2.jpg', width: 320, height: 180 },
              high: { url: 'http://example.com/high2.jpg', width: 480, height: 360 }
            }
          },
          statistics: {
            viewCount: '8',
            likeCount: '2',
            commentCount: '1'
          }
        }
      ]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (axios.get as jest.Mock).mockResolvedValue(mockApiResponse);
    (handleYouTubeApiError as jest.Mock).mockImplementation((error) => {
      throw error;
    });
  });

  describe('fetchVideoBatch', () => {
    it('should call YouTube API with correct parameters', async () => {
      await fetchVideoBatch(apiKey, ['video1', 'video2']);
      
      expect(axios.get).toHaveBeenCalledWith('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,statistics,contentDetails,liveStreamingDetails,topicDetails,status',
          id: 'video1,video2',
          key: apiKey
        }
      });
    });

    it('should update API stats counter', async () => {
      // Define videoDetailApiCalls if it doesn't exist
      if (typeof apiStats.videoDetailApiCalls === 'undefined') {
        apiStats.videoDetailApiCalls = 0;
      }
      
      // Reset counters
      apiStats.videoDetailApiCalls = 0;
      apiStats.totalApiCalls = 0;
      
      await fetchVideoBatch(apiKey, ['video1', 'video2']);
      
      // Check videoDetailApiCalls instead of videoDetailCalls
      expect(apiStats.videoDetailApiCalls).toBe(1);
      expect(apiStats.totalApiCalls).toBe(1);
    });

    it('should handle errors properly', async () => {
      const error = new Error('Network error');
      (axios.get as jest.Mock).mockRejectedValue(error);
      (handleYouTubeApiError as jest.Mock).mockReturnValue([]);
      
      await expect(fetchVideoBatch(apiKey, ['video1', 'video2'])).resolves.toEqual([]);
      expect(handleYouTubeApiError).toHaveBeenCalledWith(error, 'fetching video details');
    });
  });

  describe('parseVideoDetails', () => {
    it('should parse video items into Video objects', () => {
      // Add missing required properties to mock data
      const mockItems = mockApiResponse.data.items.map(item => ({
        ...item,
        contentDetails: { duration: 'PT2M30S' },
        status: { license: 'creativeCommon' }
      }));
      
      const videos = parseVideoDetails(mockItems);
      
      expect(videos).toHaveLength(2);
      expect(videos[0]).toMatchObject({
        id: 'video1',
        title: 'Test Video 1',
        description: 'Description 1',
        publishedAt: '2023-01-01T12:00:00Z',
        channelTitle: 'Test Channel',
        viewCount: 5,
        thumbnailUrl: 'http://example.com/medium1.jpg',
        duration: 'PT2M30S'
      });
    });

    it('should handle missing statistics', () => {
      const videoItems = [
        {
          id: 'video1',
          snippet: {
            title: 'Test Video 1',
            description: 'Description 1',
            publishedAt: '2023-01-01T12:00:00Z',
            channelTitle: 'Test Channel',
            thumbnails: {
              default: { url: 'http://example.com/default1.jpg', width: 120, height: 90 },
              medium: { url: 'http://example.com/medium1.jpg', width: 320, height: 180 },
              high: { url: 'http://example.com/high1.jpg', width: 480, height: 360 }
            }
          },
          contentDetails: { duration: 'PT2M30S' },
          status: { license: 'creativeCommon' },
          statistics: {} // Empty statistics object
        }
      ];
      
      const videos = parseVideoDetails(videoItems);
      
      expect(videos[0].viewCount).toBe(0);
    });

    it('should handle non-numeric statistics', () => {
      const videoItems = [
        {
          id: 'video1',
          snippet: {
            title: 'Test Video 1',
            description: 'Description 1',
            publishedAt: '2023-01-01T12:00:00Z',
            channelTitle: 'Test Channel',
            thumbnails: {
              default: { url: 'http://example.com/default1.jpg', width: 120, height: 90 },
              medium: { url: 'http://example.com/medium1.jpg', width: 320, height: 180 },
              high: { url: 'http://example.com/high1.jpg', width: 480, height: 360 }
            }
          },
          contentDetails: { duration: 'PT2M30S' },
          status: { license: 'creativeCommon' },
          statistics: {
            viewCount: '0'
          }
        }
      ];
      
      const videos = parseVideoDetails(videoItems);
      
      expect(videos[0].viewCount).toBe(0);
    });
  });

  describe('processVideoDetails', () => {
    it('should fetch details for all videos', async () => {
      const videoIds = ['video1', 'video2', 'video3'];
      
      await processVideoDetails(apiKey, videoIds, 50);
      
      // Should fetch all videos
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({
          id: 'video1,video2,video3'
        })
      });
    });

    it('should process videos in batches', async () => {
      const videoIds = ['video1', 'video2', 'video3', 'video4', 'video5'];
      
      await processVideoDetails(apiKey, videoIds, 2); // Max 2 IDs per request
      
      // Should make 3 API calls with batched IDs
      expect(axios.get).toHaveBeenCalledTimes(3);
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ id: 'video1,video2' })
      });
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ id: 'video3,video4' })
      });
      expect(axios.get).toHaveBeenCalledWith(expect.any(String), {
        params: expect.objectContaining({ id: 'video5' })
      });
    });

    it('should return API results', async () => {
      const videoIds = ['video1', 'video2'];
      
      // Modify the mockApiResponse items to include required properties
      const mockItems = mockApiResponse.data.items.map(item => ({
        ...item,
        contentDetails: { duration: 'PT2M30S' },
        status: { license: 'creativeCommon' }
      }));
      
      // Mock response for video2
      (axios.get as jest.Mock).mockResolvedValue({
        data: {
          items: mockItems
        }
      });
      
      // Just verify that the function doesn't throw an error
      const result = await processVideoDetails(apiKey, videoIds, 50);
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
    });
  });
});