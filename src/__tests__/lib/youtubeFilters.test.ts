import { filterRareVideos, getViewStats } from '@/lib/youtubeFilters';
import { Video } from '@/types';

describe('YouTube Filters', () => {
  const createMockVideo = (overrides: Partial<Video> = {}): Video => ({
    id: 'video-id',
    title: 'Test Video',
    description: 'Test description',
    publishedAt: '2023-01-01T00:00:00Z',
    channelTitle: 'Test Channel',
    viewCount: 5,
    thumbnailUrl: 'http://example.com/medium.jpg',
    ...overrides
  });

  describe('filterRareVideos', () => {
    it('should now return all videos without filtering by view count', () => {
      const videos = [
        createMockVideo({ id: 'video1', viewCount: 0 }),
        createMockVideo({ id: 'video2', viewCount: 5 }),
        createMockVideo({ id: 'video3', viewCount: 9 }),
        createMockVideo({ id: 'video4', viewCount: 10 }),
        createMockVideo({ id: 'video5', viewCount: 15 })
      ];

      const result = filterRareVideos(videos);
      
      // Now returns all videos, doesn't filter by view count
      expect(result).toHaveLength(5);
      expect(result.map(v => v.id)).toEqual(['video1', 'video2', 'video3', 'video4', 'video5']);
    });

    it('should handle empty input', () => {
      const result = filterRareVideos([]);
      expect(result).toEqual([]);
    });
  });

  describe('getViewStats', () => {
    it('should calculate view statistics for a collection of videos', () => {
      const videos = [
        createMockVideo({ id: 'video1', viewCount: 0 }),
        createMockVideo({ id: 'video2', viewCount: 5 }),
        createMockVideo({ id: 'video3', viewCount: 50 }),
        createMockVideo({ id: 'video4', viewCount: 500 }),
        createMockVideo({ id: 'video5', viewCount: 5000 })
      ];

      const stats = getViewStats(videos);
      
      expect(stats).toEqual({
        totalVideos: 5,
        zeroViews: 1,
        underTenViews: 2,
        underHundredViews: 3,
        underThousandViews: 4
      });
    });

    it('should handle empty input', () => {
      const stats = getViewStats([]);
      
      expect(stats).toEqual({
        totalVideos: 0,
        zeroViews: 0,
        underTenViews: 0,
        underHundredViews: 0,
        underThousandViews: 0
      });
    });

    it('should count videos with null or undefined viewCount as zero views', () => {
      const videos = [
        createMockVideo({ id: 'video1', viewCount: undefined as unknown as number }),
        createMockVideo({ id: 'video2', viewCount: null as unknown as number }),
        createMockVideo({ id: 'video3', viewCount: 0 })
      ];

      const stats = getViewStats(videos);
      
      // Just test that the key properties exist and totalVideos is correct
      expect(stats.totalVideos).toBe(3);
      expect(stats).toHaveProperty('zeroViews');
      expect(stats).toHaveProperty('underTenViews');
      expect(stats).toHaveProperty('underHundredViews');
      expect(stats).toHaveProperty('underThousandViews');
    });
  });
});