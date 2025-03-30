// API configuration
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Time-related constants
export const YOUTUBE_FOUNDING_DATE = new Date(2005, 3, 23); // April 23, 2005 - when YouTube was first launched
export const STATUS_MESSAGE_DELAY_MS = 1200;

// Search parameters
export const RARE_VIEW_THRESHOLD = 0; // Only true treasures with 0 views
export const DEFAULT_SEARCH_DURATION_MINUTES = 1440; // Fixed 24-hour window (24 * 60 = 1440 minutes)
export const MAX_BATCH_SIZE = 50; // Maximum videos per API call

// Reroll settings
export const MAX_REROLLS = 7;  // Maximum number of rerolls before giving up