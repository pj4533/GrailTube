import axios from 'axios';
import { Video, TimeWindow } from '@/types';
import { createTimeWindow, getWindowCenter } from './utils';
import { 
  YOUTUBE_API_URL, 
  RARE_VIEW_THRESHOLD,
  AGGRESSIVE_EXPANSION_FACTOR
} from './constants';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Expand time window with given expansion factor
export function expandTimeWindow(window: TimeWindow, factor = AGGRESSIVE_EXPANSION_FACTOR): TimeWindow {
  const centerTime = getWindowCenter(window);
  const newDuration = window.durationMinutes * factor;
  return createTimeWindow(centerTime, newDuration);
}

// Get videos uploaded in a time window
export async function searchVideosInTimeWindow(window: TimeWindow): Promise<string[]> {
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 50,
        type: 'video',
        publishedAfter: window.startDate.toISOString(),
        publishedBefore: window.endDate.toISOString(),
        key: API_KEY,
      },
    });
    
    return response.data.items.map((item: any) => item.id.videoId);
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
}

// Get detailed information for multiple videos
export async function getVideoDetails(videoIds: string[]): Promise<Video[]> {
  if (!videoIds.length) return [];
  
  try {
    const response = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoIds.join(','),
        key: API_KEY,
      },
    });
    
    return response.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(item.statistics.viewCount, 10),
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error('Error getting video details:', error);
    return [];
  }
}

// Find videos with less than the rare view threshold
export function filterRareVideos(videos: Video[]): Video[] {
  return videos.filter(video => video.viewCount < RARE_VIEW_THRESHOLD);
}