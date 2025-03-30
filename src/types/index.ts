export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  channelTitle: string;
}

export interface TimeWindow {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}