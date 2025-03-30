import axios from 'axios';
import { addMinutes, subMinutes, subDays, addHours, format } from 'date-fns';
import { Video } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3';

// Time window expansion strategy
export type TimeWindow = {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
};

// Get a random date between 2005 (YouTube's founding) and today
export function getRandomPastDate(): Date {
  const start = new Date(2005, 1, 14); // YouTube's founding date
  const end = subDays(new Date(), 1); // Yesterday
  
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTimestamp);
}

// Format a time window for display
export function formatTimeWindow(window: TimeWindow): string {
  return `${format(window.startDate, 'MMM d, yyyy h:mm a')} to ${format(window.endDate, 'h:mm a')} (${window.durationMinutes} mins)`;
}

// Create initial time window (60 minutes)
export function createInitialTimeWindow(centerDate: Date): TimeWindow {
  const startDate = subMinutes(centerDate, 30);
  const endDate = addMinutes(centerDate, 30);
  return {
    startDate,
    endDate,
    durationMinutes: 60
  };
}

// Expand time window more aggressively
export function expandTimeWindow(window: TimeWindow): TimeWindow {
  const centerTime = new Date((window.startDate.getTime() + window.endDate.getTime()) / 2);
  // Triple the duration each time, max 24 hours (1440 minutes)
  const newDuration = Math.min(window.durationMinutes * 3, 1440);
  const halfDuration = newDuration / 2;
  
  return {
    startDate: subMinutes(centerTime, halfDuration),
    endDate: addMinutes(centerTime, halfDuration),
    durationMinutes: newDuration
  };
}

// Get videos uploaded in a time window
export async function searchVideosInTimeWindow(window: TimeWindow): Promise<string[]> {
  try {
    const response = await axios.get(`${API_URL}/search`, {
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
    const response = await axios.get(`${API_URL}/videos`, {
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

// Find videos with less than 5 views
export function filterRareVideos(videos: Video[]): Video[] {
  return videos.filter(video => video.viewCount < 5);
}