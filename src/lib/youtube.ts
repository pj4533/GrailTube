import axios from 'axios';
import { addMinutes, subDays } from 'date-fns';
import { Video } from '@/types';

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const API_URL = 'https://www.googleapis.com/youtube/v3';

// Get a random date between 2005 (YouTube's founding) and today
export function getRandomPastDate(): Date {
  const start = new Date(2005, 1, 14); // YouTube's founding date
  const end = subDays(new Date(), 1); // Yesterday
  
  const randomTimestamp = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTimestamp);
}

// Get videos uploaded in a specific 10-minute window
export async function searchVideosInTimeWindow(startDate: Date): Promise<string[]> {
  const endDate = addMinutes(startDate, 10);
  
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 50,
        type: 'video',
        publishedAfter: startDate.toISOString(),
        publishedBefore: endDate.toISOString(),
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