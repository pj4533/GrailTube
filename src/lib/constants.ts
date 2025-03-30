// API configuration
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Time-related constants
export const YOUTUBE_FOUNDING_DATE = new Date(2005, 1, 14);
export const STATUS_MESSAGE_DELAY_MS = 1200;

// Search parameters
export const RARE_VIEW_THRESHOLD = 5;
export const DEFAULT_SEARCH_DURATION_MINUTES = 60;
export const MIN_WINDOW_DURATION_MINUTES = 30;

// Search thresholds for adaptive window sizing
export const BUSY_PERIOD_THRESHOLD = 200;
export const MODERATE_PERIOD_THRESHOLD = 50;

// Expansion factors
export const AGGRESSIVE_EXPANSION_FACTOR = 3;
export const MODERATE_EXPANSION_FACTOR = 1.5;
export const CONTRACTION_FACTOR = 0.8;