import {
  adaptSavedVideoToVideo,
  isSavedVideo,
  prepareVideoForSaving
} from '@/lib/videoAdapter';
import { Video, SavedVideo } from '@/types';

describe('Video Adapter', () => {
  // Test data
  const mockSavedVideo: SavedVideo = {
    video_id: 'video123',
    title: 'Test Saved Video',
    description: 'This is a test description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    channelTitle: 'Test Channel',
    channelId: 'UC12345',
    publishedAt: '2023-01-01T00:00:00Z',
    view_count_at_discovery: 5,
    discovered_at: '2023-01-15T00:00:00Z',
    duration: 'PT2M30S'
  };

  const mockVideo: Video = {
    id: 'video456',
    title: 'Test Video',
    description: 'This is another test description',
    thumbnailUrl: 'http://example.com/another-thumbnail.jpg',
    channelTitle: 'Another Channel',
    channelId: 'UC67890',
    publishedAt: '2023-02-01T00:00:00Z',
    viewCount: 10,
    duration: 'PT3M45S'
  };

  describe('adaptSavedVideoToVideo', () => {
    it('converts a SavedVideo to Video format correctly', () => {
      const result = adaptSavedVideoToVideo(mockSavedVideo);
      
      expect(result).toEqual({
        id: 'video123',
        title: 'Test Saved Video',
        description: 'This is a test description',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        channelTitle: 'Test Channel',
        channelId: 'UC12345',
        publishedAt: '2023-01-01T00:00:00Z',
        viewCount: 5,
        duration: 'PT2M30S'
      });
      
      // Ensure we're getting the right id
      expect(result.id).toBe(mockSavedVideo.video_id);
      
      // Ensure view count is using view_count_at_discovery
      expect(result.viewCount).toBe(mockSavedVideo.view_count_at_discovery);
    });

    it('handles null or undefined values gracefully', () => {
      const incompleteSavedVideo: SavedVideo = {
        ...mockSavedVideo,
        view_count_at_discovery: undefined as any,
        channelId: undefined,
        duration: undefined
      };
      
      const result = adaptSavedVideoToVideo(incompleteSavedVideo);
      
      expect(result.viewCount).toBe(0); // Should default to 0
      expect(result.channelId).toBeUndefined();
      expect(result.duration).toBeUndefined();
    });
  });

  describe('isSavedVideo', () => {
    it('correctly identifies a SavedVideo object', () => {
      expect(isSavedVideo(mockSavedVideo)).toBe(true);
    });

    it('correctly identifies a regular Video object', () => {
      expect(isSavedVideo(mockVideo)).toBe(false);
    });
  });

  describe('prepareVideoForSaving', () => {
    it('transforms a Video object for database storage', () => {
      const result = prepareVideoForSaving(mockVideo);
      
      expect(result).toEqual({
        video_id: 'video456',
        title: 'Test Video',
        description: 'This is another test description',
        thumbnail_url: 'https://example.com/another-thumbnail.jpg', // Should convert to HTTPS
        channel_title: 'Another Channel',
        channel_id: 'UC67890',
        published_at: '2023-02-01 00:00:00', // Should format date for MySQL
        view_count_at_discovery: 10,
        duration: 'PT3M45S'
      });
    });

    it('converts HTTP thumbnail URLs to HTTPS', () => {
      const result = prepareVideoForSaving(mockVideo);
      expect(result.thumbnail_url).toMatch(/^https:/);
    });

    it('handles a video with missing thumbnailUrl', () => {
      const videoWithoutThumbnail: Video = {
        ...mockVideo,
        thumbnailUrl: undefined as any
      };
      
      const result = prepareVideoForSaving(videoWithoutThumbnail);
      expect(result.thumbnail_url).toBe('');
    });

    it('handles a video with missing duration', () => {
      const videoWithoutDuration: Video = {
        ...mockVideo,
        duration: undefined
      };
      
      const result = prepareVideoForSaving(videoWithoutDuration);
      expect(result.duration).toBeNull();
    });

    it('handles a video with missing viewCount', () => {
      const videoWithoutViewCount: Video = {
        ...mockVideo,
        viewCount: undefined as any
      };
      
      const result = prepareVideoForSaving(videoWithoutViewCount);
      expect(result.view_count_at_discovery).toBe(0);
    });

    it('handles a video with missing channelId', () => {
      const videoWithoutChannelId: Video = {
        ...mockVideo,
        channelId: undefined
      };
      
      const result = prepareVideoForSaving(videoWithoutChannelId);
      expect(result.channel_id).toBeNull();
    });
  });
});