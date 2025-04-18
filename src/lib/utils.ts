import { format, addMinutes, subMinutes, subDays } from 'date-fns';
import { TimeWindow, SearchType } from '@/types';
import { YOUTUBE_FOUNDING_DATE, UNEDITED_WINDOW_DAYS } from './constants';

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

/**
 * Generate a random year-month string in YYYY-MM format
 * from YouTube's founding date to yesterday
 */
export function getRandomYearMonth(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // YouTube founding: April 2005
  const startYear = 2005;
  const startMonth = 3; // April is month 3 (0-indexed)
  
  // Generate a random year between start year and current year
  const randomYear = startYear + Math.floor(Math.random() * (currentYear - startYear + 1));
  
  // Determine month range based on the selected year
  let minMonth = 0;
  let maxMonth = 11;
  
  if (randomYear === startYear) {
    minMonth = startMonth; // If it's 2005, start from April
  }
  
  if (randomYear === currentYear) {
    maxMonth = currentMonth; // If it's current year, only go up to current month
  }
  
  // Generate a random month in the valid range
  const randomMonth = minMonth + Math.floor(Math.random() * (maxMonth - minMonth + 1));
  
  // Return in YYYY-MM format
  return `${randomYear}-${(randomMonth + 1).toString().padStart(2, '0')}`;
}

/**
 * Get a random date from a specific year and month
 */
export function getDateFromYearMonth(yearMonth: string): Date {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // Determine the number of days in the month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Generate a random day in the month
  const randomDay = 1 + Math.floor(Math.random() * daysInMonth);
  
  // Create the date with a random time
  const date = new Date(year, month - 1, randomDay); // month-1 because months are 0-indexed in JS
  
  // Set a random time
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  
  return date;
}

// Get a random date between YouTube's founding and today
export function getRandomPastDate(): Date {
  // Use crypto.getRandomValues for true randomness if available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Normalize to 0-1 range
    const randomValue = array[0] / (0xFFFFFFFF + 1);
    
    const end = subDays(new Date(), 1); // Yesterday
    const randomTimestamp = YOUTUBE_FOUNDING_DATE.getTime() + randomValue * (end.getTime() - YOUTUBE_FOUNDING_DATE.getTime());
    return new Date(randomTimestamp);
  } else {
    // For non-browser environments (like SSR), use a timestamp-seeded random value
    const seed = Date.now() % 10000; // Use last 4 digits of current timestamp as seed
    const randomValue = (Math.sin(seed) * 10000) % 1;
    
    const end = subDays(new Date(), 1); // Yesterday
    const randomTimestamp = YOUTUBE_FOUNDING_DATE.getTime() + randomValue * (end.getTime() - YOUTUBE_FOUNDING_DATE.getTime());
    return new Date(randomTimestamp);
  }
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
  } else if (duration === 43200) { // 30 days in minutes = 43200
    periodDescription = "1-month period";
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

// Create initial time window for unedited search
export function createInitialTimeWindow(centerDate: Date, isUnedited: boolean = true): TimeWindow {
  // Calculate duration in minutes from days constant
  const durationMinutes = UNEDITED_WINDOW_DAYS * 24 * 60;
  
  return createTimeWindow(centerDate, durationMinutes);
}

// Add delay (useful for UI updates)
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}