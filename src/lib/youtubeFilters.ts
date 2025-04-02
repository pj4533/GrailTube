import { Video, ViewStats } from '@/types';

/**
 * Filter videos with less than 10 views only
 */
export function filterRareVideos(videos: Video[]): Video[] {
  return videos.filter(video => {
    // Must have less than 10 views
    if (video.viewCount >= 10) return false;
    
    // Include this video (passed view count check)
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
  
  // Count videos by view thresholds
  videos.forEach(video => {
    if (video.viewCount === 0) zeroViews++;
    if (video.viewCount < 10) underTenViews++;
    if (video.viewCount < 100) underHundredViews++;
    if (video.viewCount < 1000) underThousandViews++;
  });
  
  return {
    totalVideos: videos.length,
    zeroViews,
    underTenViews,
    underHundredViews,
    underThousandViews
  };
}