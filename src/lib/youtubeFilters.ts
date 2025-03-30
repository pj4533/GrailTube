import { Video, ViewStats } from '@/types';
import { EXCLUDED_CATEGORIES } from './constants';

/**
 * Keywords that indicate commercial movie/TV purchase content
 */
const COMMERCIAL_KEYWORDS = [
  // Movie/TV purchase indicators
  'buy', 'rent', 'purchase', 'trailer', 'official', 'hd', '4k',
  // Movie studio references
  'warner', 'disney', 'paramount', 'sony', 'universal', 'mgm', 'lionsgate',
  // Streaming services
  'netflix', 'hulu', 'amazon', 'prime video', 'hbo', 'max', 'disney+',
  // Common commercial phrases
  'now available', 'digital', 'bluray', 'blu-ray', 'dvd', 
  'full movie', 'full episode', 'season', 'episode'
];

/**
 * Extended TV show indicators
 */
const TV_SHOW_KEYWORDS = [
  'tv series', 'tv show', 'television', 'episode', 'season',
  'watch now', 'streaming now', 'now streaming'
];

/**
 * Filter out videos in excluded YouTube categories
 */
export function filterExcludedCategories(items: any[]): any[] {
  return items.filter((item: any) => {
    // Check if the video is in an excluded category
    const categoryId = item.snippet?.categoryId;
    if (categoryId && EXCLUDED_CATEGORIES.includes(categoryId)) {
      console.log(`Filtered out video in excluded category: "${item.snippet.title}" (category: ${categoryId})`);
      return false;
    }
    
    // Include videos that don't have a category or aren't in excluded categories
    return true;
  });
}

/**
 * Filter videos with less than 10 views and not streams or commercial content
 */
export function filterRareVideos(videos: Video[]): Video[] {
  return videos.filter(video => {
    // Must have less than 10 views
    if (video.viewCount >= 10) return false;
    
    // Filter out live streams and upcoming streams
    if (video.isLiveStream || video.isUpcoming) return false;
    
    // Convert title and description to lowercase for case-insensitive matching
    const lowerTitle = video.title.toLowerCase();
    const lowerDescription = video.description?.toLowerCase() || '';
    
    // Filter out videos with "stream" or "live" in the title (often stream announcements)
    if (lowerTitle.includes('stream') || 
        lowerTitle.includes('live') || 
        lowerTitle.includes('premiere')) return false;
    
    // Check for commercial keywords in title or description
    for (const keyword of COMMERCIAL_KEYWORDS) {
      if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
        console.log(`Filtered out commercial video: "${video.title}" (matched keyword: ${keyword})`);
        return false;
      }
    }
    
    // Check for TV show indicators
    for (const keyword of TV_SHOW_KEYWORDS) {
      if (lowerTitle.includes(keyword) || lowerDescription.includes(keyword)) {
        console.log(`Filtered out TV show video: "${video.title}" (matched keyword: ${keyword})`);
        return false;
      }
    }
    
    // Filter videos with high production value indicators
    if (video.title.includes('©') || 
        video.description?.includes('©') || 
        video.title.includes('™') || 
        video.description?.includes('™')) {
      console.log(`Filtered out commercial video: "${video.title}" (matched copyright/trademark)`);
      return false;
    }
    
    // Include this video (passed all filter checks)
    return true;
  });
}

/**
 * Filter out live streams and announcements
 */
export function filterLiveStreams(videos: Video[]): Video[] {
  return videos.filter(video => {
    // Filter out live streams and upcoming streams
    if (video.isLiveStream || video.isUpcoming) return false;
    
    // Filter out videos with "stream" or "live" in the title (often stream announcements)
    const lowerTitle = video.title.toLowerCase();
    if (lowerTitle.includes('stream') || 
        lowerTitle.includes('live') || 
        lowerTitle.includes('premiere')) return false;
    
    // Include this video
    return true;
  });
}

/**
 * Generate view statistics from video collection
 */
export function getViewStats(videos: Video[]): ViewStats {
  // Count different view categories
  let underTenViews = 0;
  let underHundredViews = 0;
  let underThousandViews = 0;
  let zeroViews = 0;
  
  // Filter out live streams and announcements first
  const filteredVideos = filterLiveStreams(videos);
  
  // Count videos by view thresholds
  filteredVideos.forEach(video => {
    if (video.viewCount === 0) zeroViews++;
    if (video.viewCount < 10) underTenViews++;
    if (video.viewCount < 100) underHundredViews++;
    if (video.viewCount < 1000) underThousandViews++;
  });
  
  return {
    totalVideos: filteredVideos.length,
    zeroViews,
    underTenViews,
    underHundredViews,
    underThousandViews
  };
}