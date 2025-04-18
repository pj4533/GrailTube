import { Video, ViewStats } from '@/types';

/**
 * Previously filtered videos with less than 10 views only
 * Now returns all videos (no view count filtering) to provide more results
 * Videos will still be sorted by view count later to prioritize the rarest ones
 */
export function filterRareVideos(videos: Video[]): Video[] {
  // Return all videos without filtering by view count
  return videos;
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