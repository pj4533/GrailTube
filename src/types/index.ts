export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  channelTitle: string;
  channelId?: string;
  duration?: string;
}

export interface SavedVideo extends Omit<Video, 'id'> {
  video_id: string;
  view_count_at_discovery: number;
  discovered_at: string;
}

export interface ViewStats {
  totalVideos: number;
  underTenViews: number;
  underHundredViews: number;
  underThousandViews: number;
  zeroViews: number;
}

export interface TimeWindow {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
}

export enum SearchType {
  Unedited = 'unedited'
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}