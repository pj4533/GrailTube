/**
 * Common API utilities and error handling
 */
import { AxiosError } from 'axios';
import { YouTubeRateLimitError } from './youtubeTypes';

// Generic API error handling
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Check if the API error is a rate limit error
 */
export function isRateLimitError(error: AxiosError): boolean {
  if (!error.response || !error.response.data) return false;
  
  const errorDetails = error.response.data as any;
  const status = error.response.status;
  
  // Direct quota/rate limit errors
  if (status === 403 && errorDetails.error?.errors?.some((e: any) => 
      e.reason === 'quotaExceeded' || e.reason === 'rateLimitExceeded')) {
    return true;
  }
  
  // Other potential rate limiting responses
  return (status === 429 || status === 403);
}

/**
 * Standard API response helper
 */
export function createApiResponse<T>(data: T, success = true, message?: string) {
  return {
    success,
    message,
    data
  };
}

/**
 * HTTP Client that standardizes request handling
 */
export async function fetchApi<T = any>(
  url: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || 'An unexpected error occurred';
      throw new ApiError(errorMessage, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API request failed:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to complete request'
    );
  }
}

/**
 * Standard error handler for API route handlers
 */
export function handleApiError(error: unknown, context: string = 'API'): { error: string; status: number } {
  console.error(`Error in ${context}:`, error);
  
  // Handle YouTube API errors for fetch operations
  if (error && typeof error === 'object' && 'isAxiosError' in error && error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    if (isRateLimitError(axiosError)) {
      console.error(`YouTube API rate limit reached during ${context}:`, axiosError.response?.data);
      if (context === 'API') {
        // For API routes, return object with error and status
        return {
          error: 'YouTube API quota exceeded. Please try again later.',
          status: 429
        };
      } else {
        // For service layer, throw or return empty array
        throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
      }
    }
  }
  
  // Handle standard API errors
  if (error instanceof ApiError) {
    return {
      error: error.message,
      status: error.status
    };
  }
  
  // For YouTube service layer, the response is handled differently
  // This function is overloaded for those contexts in youtubeTypes.ts
  
  // Default error response
  return {
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500
  };
}