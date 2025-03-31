import { VideoModel } from '@/lib/models/videoModel';
import { query } from '@/lib/db';
import { prepareVideoForSaving } from '@/lib/videoAdapter';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

jest.mock('@/lib/videoAdapter', () => ({
  prepareVideoForSaving: jest.fn(),
}));

jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('VideoModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return true when database connection is successful', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ connection_test: 1 }]);
      
      const result = await VideoModel.testConnection();
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith('SELECT 1 AS connection_test');
    });

    it('should throw an error when database connection fails', async () => {
      const testError = new Error('Connection failed');
      (query as jest.Mock).mockRejectedValueOnce(testError);
      
      await expect(VideoModel.testConnection()).rejects.toThrow('Connection failed');
    });
  });

  describe('getAll', () => {
    it('should return formatted videos', async () => {
      const mockDbResponse = [
        {
          id: 1,
          video_id: 'abc123',
          title: 'Test Video',
          description: 'Description',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          channelTitle: 'Test Channel',
          publishedAt: new Date('2023-01-01'),
          view_count_at_discovery: 1000,
          discovered_at: new Date('2023-01-02'),
          duration: 'PT2M30S'
        }
      ];
      
      (query as jest.Mock).mockResolvedValueOnce(mockDbResponse);
      
      const result = await VideoModel.getAll();
      
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Video');
      expect(result[0].publishedAt).toBe(new Date('2023-01-01').toISOString());
      expect(result[0].discovered_at).toBe(new Date('2023-01-02').toISOString());
    });

    it('should return empty array when query returns non-array', async () => {
      (query as jest.Mock).mockResolvedValueOnce(null);
      
      const result = await VideoModel.getAll();
      
      expect(result).toEqual([]);
    });

    it('should throw when query fails', async () => {
      const testError = new Error('Query failed');
      (query as jest.Mock).mockRejectedValueOnce(testError);
      
      await expect(VideoModel.getAll()).rejects.toThrow('Query failed');
    });
  });

  describe('findById', () => {
    it('should return null when no video is found', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);
      
      const result = await VideoModel.findById('non-existent-id');
      
      expect(result).toBeNull();
      expect(query).toHaveBeenCalledWith(expect.any(String), ['non-existent-id']);
    });

    it('should return formatted video when found', async () => {
      const mockDbResponse = [
        {
          id: 1,
          video_id: 'abc123',
          title: 'Test Video',
          description: 'Description',
          thumbnailUrl: 'https://example.com/thumb.jpg',
          channelTitle: 'Test Channel',
          publishedAt: new Date('2023-01-01'),
          view_count_at_discovery: 1000,
          discovered_at: new Date('2023-01-02'),
          duration: 'PT2M30S'
        }
      ];
      
      (query as jest.Mock).mockResolvedValueOnce(mockDbResponse);
      
      const result = await VideoModel.findById('abc123');
      
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Test Video');
      expect(result?.publishedAt).toBe(new Date('2023-01-01').toISOString());
    });
  });

  describe('save', () => {
    it('should call prepareVideoForSaving and insert the video', async () => {
      const mockVideo = {
        id: 'abc123',
        title: 'Test Video',
        description: 'Description',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        channelTitle: 'Test Channel',
        publishedAt: '2023-01-01T00:00:00.000Z',
        statistics: { viewCount: '1000' },
        duration: 'PT2M30S'
      };
      
      const preparedVideo = {
        video_id: 'abc123',
        title: 'Test Video',
        description: 'Description',
        thumbnail_url: 'https://example.com/thumb.jpg',
        channel_title: 'Test Channel',
        published_at: '2023-01-01T00:00:00.000Z',
        view_count_at_discovery: 1000,
        duration: 'PT2M30S'
      };
      
      (prepareVideoForSaving as jest.Mock).mockReturnValueOnce(preparedVideo);
      (query as jest.Mock).mockResolvedValueOnce({ affectedRows: 1 });
      
      await VideoModel.save(mockVideo as any);
      
      expect(prepareVideoForSaving).toHaveBeenCalledWith(mockVideo);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO saved_videos'),
        expect.arrayContaining([
          'abc123', 
          'Test Video', 
          'Description', 
          'https://example.com/thumb.jpg',
          'Test Channel',
          '2023-01-01T00:00:00.000Z',
          1000,
          'PT2M30S'
        ])
      );
    });
  });

  describe('remove', () => {
    it('should return true when video was deleted', async () => {
      (query as jest.Mock).mockResolvedValueOnce({ affectedRows: 1 });
      
      const result = await VideoModel.remove('abc123');
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        'DELETE FROM saved_videos WHERE video_id = ?',
        ['abc123']
      );
    });

    it('should return false when no video was deleted', async () => {
      (query as jest.Mock).mockResolvedValueOnce({ affectedRows: 0 });
      
      const result = await VideoModel.remove('non-existent-id');
      
      expect(result).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true when video exists', async () => {
      (query as jest.Mock).mockResolvedValueOnce([{ '1': 1 }]);
      
      const result = await VideoModel.exists('abc123');
      
      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        'SELECT 1 FROM saved_videos WHERE video_id = ? LIMIT 1',
        ['abc123']
      );
    });

    it('should return false when video does not exist', async () => {
      (query as jest.Mock).mockResolvedValueOnce([]);
      
      const result = await VideoModel.exists('non-existent-id');
      
      expect(result).toBe(false);
    });
  });
});