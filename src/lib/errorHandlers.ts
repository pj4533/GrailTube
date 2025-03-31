import logger from '@/lib/logger';
import { YouTubeRateLimitError } from '@/lib/youtube';

export interface ErrorHandlerOptions {
  setError?: (error: string) => void;
  setLoading?: (loading: boolean) => void;
  logContext?: string;
  customMessages?: {
    rateLimit?: string;
    default?: string;
  };
}

/**
 * Centralized error handler to be used across hooks and components
 * Consistently handles common error types and logging
 */
export function handleError(
  err: unknown, 
  options: ErrorHandlerOptions = {}
): void {
  const {
    setError,
    setLoading,
    logContext = 'operation',
    customMessages = {}
  } = options;

  const rateLimitMessage = customMessages.rateLimit || 
    'API rate limit reached. Please try again later.';
  
  const defaultMessage = customMessages.default || 
    'An unexpected error occurred. Please try again later.';

  // Handle specific error types
  if (err instanceof YouTubeRateLimitError) {
    logger.warn(`Rate limit error during ${logContext}:`, err);
    setError?.(rateLimitMessage);
  } else {
    logger.error(`Error during ${logContext}:`, err);
    setError?.(defaultMessage);
  }

  // Turn off loading state if handler provided
  if (setLoading) {
    setLoading(false);
  }
}

/**
 * Create an error handler bound to specific state setters
 * Useful in hooks to create a reusable error handler
 */
export function createErrorHandler(options: ErrorHandlerOptions) {
  return (err: unknown, context?: string) => {
    handleError(err, {
      ...options,
      logContext: context || options.logContext
    });
  };
}

const errorHandlers = {
  handleError,
  createErrorHandler,
};

export default errorHandlers;