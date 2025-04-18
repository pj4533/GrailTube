import { handleYouTubeApiError, YouTubeRateLimitError, apiStats } from '@/lib/youtubeTypes';
import axios from 'axios';

jest.mock('axios');
// Make sure TypeScript knows that our axios methods are mocked
jest.mocked(axios.isCancel);

describe('YouTubeTypes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.log = jest.fn();
  });

  describe('handleYouTubeApiError', () => {
    it('should handle cancelled requests', () => {
      const cancelError = new axios.Cancel('Request cancelled');
      jest.mocked(axios.isCancel).mockReturnValue(true);
      
      const result = handleYouTubeApiError(cancelError, 'test');
      
      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalledWith('Request cancelled:', 'test');
    });

    it('should handle quota exceeded errors', () => {
      const quotaError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'quotaExceeded' }]
            }
          }
        }
      };
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      expect(() => handleYouTubeApiError(quotaError, 'test'))
        .toThrow(YouTubeRateLimitError);
    });

    it('should handle rate limit exceeded errors', () => {
      const rateLimitError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {
            error: {
              errors: [{ reason: 'rateLimitExceeded' }]
            }
          }
        }
      };
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      expect(() => handleYouTubeApiError(rateLimitError, 'test'))
        .toThrow(YouTubeRateLimitError);
    });

    it('should handle HTTP 429 errors', () => {
      const status429Error = {
        isAxiosError: true,
        response: {
          status: 429,
          data: {}
        }
      };
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      expect(() => handleYouTubeApiError(status429Error, 'test'))
        .toThrow(YouTubeRateLimitError);
    });

    it('should handle HTTP 403 errors without quota exceeded reason', () => {
      const status403Error = {
        isAxiosError: true,
        response: {
          status: 403,
          data: {}
        }
      };
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      expect(() => handleYouTubeApiError(status403Error, 'test'))
        .toThrow(YouTubeRateLimitError);
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Generic error');
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      const result = handleYouTubeApiError(genericError, 'test');
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle axios errors without response', () => {
      const noResponseError = {
        isAxiosError: true,
        response: undefined
      };
      jest.mocked(axios.isCancel).mockReturnValue(false);
      
      const result = handleYouTubeApiError(noResponseError, 'test');
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('apiStats', () => {
    it('should reset stats correctly', () => {
      apiStats.searchApiCalls = 5;
      apiStats.videoDetailApiCalls = 10;
      apiStats.totalApiCalls = 15;
      
      apiStats.reset();
      
      expect(apiStats.searchApiCalls).toBe(0);
      expect(apiStats.videoDetailApiCalls).toBe(0);
      expect(apiStats.totalApiCalls).toBe(0);
    });
  });
});