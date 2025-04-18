// API configuration
export const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Time-related constants
export const YOUTUBE_FOUNDING_DATE = new Date(2005, 3, 23); // April 23, 2005 - when YouTube was first launched
export const STATUS_MESSAGE_DELAY_MS = 1200;

// Search parameters
export const MAX_BATCH_SIZE = 50; // Maximum videos per API call

// Search window durations (in days)
export const RANDOM_TIME_WINDOW_DAYS = 4; // 96 hours
export const UNEDITED_WINDOW_DAYS = 30; // 1 month
export const KEYWORD_WINDOW_DAYS = 60; // 2 months

// Error messages
export const ERROR_MESSAGES = {
  RATE_LIMIT: 'YouTube API rate limit reached. Please try again later.',
  NETWORK: 'Network error. Please check your connection and try again.',
  DEFAULT: 'An unexpected error occurred. Please try again later.',
  DATABASE: 'Database operation failed. Please try again later.',
  NO_VIDEOS_FOUND: 'No rare videos found. Please try a different search.',
  INVALID_SEARCH: 'Invalid search parameters. Please try again.',
};

// Admin functionality
export const ADMIN_STORAGE_KEY = 'grailtube_admin_state';
export const ADMIN_TOKEN_COOKIE = 'grailtube_admin_token';
export const ADMIN_TOKEN_EXPIRY_DAYS = 7; // Admin token expires after 7 days

// YouTube API key storage
export const YOUTUBE_API_KEY_STORAGE = 'grailtube_youtube_api_key';