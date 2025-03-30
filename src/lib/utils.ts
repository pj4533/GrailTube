import { format, addMinutes, subMinutes, subDays } from 'date-fns';
import { TimeWindow } from '@/types';
import { 
  YOUTUBE_FOUNDING_DATE, 
  DEFAULT_SEARCH_DURATION_MINUTES 
} from './constants';

// Format date for display
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Get a random date between YouTube's founding and today
export function getRandomPastDate(): Date {
  const end = subDays(new Date(), 1); // Yesterday
  const randomTimestamp = YOUTUBE_FOUNDING_DATE.getTime() + Math.random() * (end.getTime() - YOUTUBE_FOUNDING_DATE.getTime());
  return new Date(randomTimestamp);
}

// Format a time window for display
export function formatTimeWindow(window: TimeWindow): string {
  return `${format(window.startDate, 'MMM d, yyyy h:mm a')} to ${format(window.endDate, 'h:mm a')} (${window.durationMinutes} mins)`;
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

// Create initial time window 
export function createInitialTimeWindow(centerDate: Date): TimeWindow {
  return createTimeWindow(centerDate, DEFAULT_SEARCH_DURATION_MINUTES);
}

// Add delay (useful for UI updates)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}