import { format, addMinutes, subMinutes, subDays } from 'date-fns';
import { TimeWindow, SearchType } from '@/types';
import { YOUTUBE_FOUNDING_DATE } from './constants';

// Format date for display
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format duration from ISO 8601 format (PT1H30M15S) to readable format (1:30:15)
export function formatDuration(isoDuration: string | undefined): string {
  if (!isoDuration) return 'Unknown';
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'Unknown';
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Get a random date between YouTube's founding and today
export function getRandomPastDate(): Date {
  const end = subDays(new Date(), 1); // Yesterday
  const randomTimestamp = YOUTUBE_FOUNDING_DATE.getTime() + Math.random() * (end.getTime() - YOUTUBE_FOUNDING_DATE.getTime());
  return new Date(randomTimestamp);
}

// Format a time window for display
export function formatTimeWindow(window: TimeWindow): string {
  const duration = window.durationMinutes;
  
  // Determine the appropriate time period description
  let periodDescription = "";
  if (duration === 5760) { // 4 days in minutes = 5760
    periodDescription = "96-hour period";
  } else if (duration === 10080) { // 7 days in minutes = 10080
    periodDescription = "1-week period";
  } else if (duration === 86400) { // 60 days in minutes = 86400
    periodDescription = "2-month period";
  } else {
    periodDescription = `${Math.round(duration / 1440)}-day period`; // Fallback to days
  }
  
  return `${periodDescription} starting ${format(window.startDate, 'MMM d, yyyy h:mm a')}`;
}

// Create a time window from center time and duration
function createTimeWindow(centerTime: Date, durationMinutes: number): TimeWindow {
  const halfDuration = durationMinutes / 2;
  return {
    startDate: subMinutes(centerTime, halfDuration),
    endDate: addMinutes(centerTime, halfDuration),
    durationMinutes
  };
}

// Create initial time window based on search type
export function createInitialTimeWindow(centerDate: Date, isUnedited: boolean = false, searchType?: SearchType): TimeWindow {
  // Default to 4 days (96 hours) for random time search
  let durationMinutes = 5760; // 4 days in minutes (RANDOM_TIME_WINDOW_DAYS * 24 * 60)
  
  if (isUnedited) {
    // 7 days for unedited videos
    durationMinutes = 10080; // 7 days in minutes (UNEDITED_WINDOW_DAYS * 24 * 60)
  } else if (searchType === SearchType.Keyword) {
    // 60 days for keyword search
    durationMinutes = 86400; // 60 days in minutes (KEYWORD_WINDOW_DAYS * 24 * 60)
  }
  
  return createTimeWindow(centerDate, durationMinutes);
}

// Add delay (useful for UI updates)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}