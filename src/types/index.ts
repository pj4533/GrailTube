export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  channelTitle: string;
  isLiveStream?: boolean;
  isUpcoming?: boolean;
  duration?: string;
}

export interface TimeWindow {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}