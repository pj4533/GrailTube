import { format, addMinutes, subMinutes, subDays } from 'date-fns';
import { TimeWindow } from '@/types';
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
  return `24-hour period starting ${format(window.startDate, 'MMM d, yyyy h:mm a')}`;
}

// Get center time from a window
export function getWindowCenter(window: TimeWindow): Date {
  return new Date((window.startDate.getTime() + window.endDate.getTime()) / 2);
}

// Create a time window from center time and duration
export function createTimeWindow(centerTime: Date, durationMinutes: number): TimeWindow {
  const halfDuration = durationMinutes / 2;
  return {
    startDate: subMinutes(centerTime, halfDuration),
    endDate: addMinutes(centerTime, halfDuration),
    durationMinutes
  };
}

// Create initial 24-hour time window
export function createInitialTimeWindow(centerDate: Date): TimeWindow {
  // Always use 24 hours (1440 minutes)
  return createTimeWindow(centerDate, 1440);
}

// Add delay (useful for UI updates)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}