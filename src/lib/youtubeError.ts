import { AxiosError } from 'axios';
import { YouTubeRateLimitError } from './youtubeTypes';

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
 * Handle API errors consistently
 */
export function handleApiError(error: any, context: string): never | [] {
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    
    if (isRateLimitError(axiosError)) {
      console.error(`YouTube API rate limit reached during ${context}:`, axiosError.response?.data);
      throw new YouTubeRateLimitError('YouTube API quota exceeded. Please try again later.');
    }
  }
  
  // For other errors, log and return empty array
  console.error(`Error during ${context}:`, error);
  return [];
}