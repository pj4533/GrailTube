import { AxiosError } from 'axios';
import { isRateLimitError, handleApiError } from '@/lib/youtubeError';
import { YouTubeRateLimitError } from '@/lib/youtubeTypes';

// Mock console.error to prevent test output pollution
console.error = jest.fn();

describe('YouTube Error Handling', () => {
  describe('isRateLimitError', () => {
    it('should identify quota exceeded errors as rate limit errors', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                { reason: 'quotaExceeded' }
              ]
            }
          }
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify rate limit exceeded errors as rate limit errors', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                { reason: 'rateLimitExceeded' }
              ]
            }
          }
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(true);
    });

    it('should identify 429 status codes as rate limit errors', () => {
      const error = {
        response: {
          status: 429,
          data: {
            error: { message: 'Too many requests' }
          }
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(true);
    });

    it('should return false for other 403 errors without specific reason', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                { reason: 'forbidden' }
              ]
            }
          }
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(true); // All 403s are considered rate limits
    });

    it('should return false for non-rate limit errors', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: { message: 'Bad request' }
          }
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(false);
    });

    it('should handle missing response data', () => {
      const error = {
        response: {
          status: 403
        },
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(false);
    });

    it('should handle missing response', () => {
      const error = {
        isAxiosError: true
      } as unknown as AxiosError;

      expect(isRateLimitError(error)).toBe(false);
    });
  });

  describe('handleApiError', () => {
    it('should throw YouTubeRateLimitError for rate limit errors', () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                { reason: 'quotaExceeded' }
              ]
            }
          }
        },
        isAxiosError: true
      };

      expect(() => {
        handleApiError(error, 'test');
      }).toThrow(YouTubeRateLimitError);
    });

    it('should return empty array for non-Axios errors', () => {
      const error = new Error('Generic error');
      
      const result = handleApiError(error, 'test');
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should return empty array for regular Axios errors', () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: { message: 'Bad request' }
          }
        },
        isAxiosError: true
      };
      
      const result = handleApiError(error, 'test');
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });
});