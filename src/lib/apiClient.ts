import { API_BASE_URL } from './constants';
import logger from './logger';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  statusCode: number;
}

/**
 * API Client utility for making consistent HTTP requests
 */
export const apiClient = {
  /**
   * Base fetch method with error handling and response parsing
   */
  async fetch<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    try {
      // Build URL with query parameters if provided
      let url = `${API_BASE_URL}${endpoint}`;
      if (options.params) {
        const searchParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
        url = `${url}?${searchParams.toString()}`;
      }

      logger.debug('apiClient: Fetching', { url, method: options.method || 'GET' });

      // Default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Make the fetch request
      logger.time(`fetch:${endpoint}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });
      logger.timeEnd(`fetch:${endpoint}`);

      // Get status code
      const statusCode = response.status;
      logger.debug('apiClient: Response received', { statusCode });

      // Parse the response
      let data: T | null = null;
      if (statusCode !== 204) { // No content
        try {
          data = await response.json();
          logger.debug('apiClient: Response data', { data });
        } catch (e) {
          logger.warn('apiClient: Failed to parse JSON response', { error: e });
          // If not JSON, leave data as null
        }
      }

      // Handle error responses
      if (!response.ok) {
        // Check for multiple error message formats from our API
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        
        if (data) {
          if (typeof data === 'object') {
            if ('message' in data) {
              errorMessage = String(data.message);
            } else if ('error' in data) {
              errorMessage = String(data.error);
            }
          }
        }
        
        logger.error('apiClient: Request failed', { 
          statusCode, 
          errorMessage, 
          endpoint 
        });
        
        return {
          data: null,
          error: errorMessage,
          statusCode,
        };
      }

      // Return successful response
      logger.debug('apiClient: Request successful', { endpoint });
      return {
        data,
        error: null,
        statusCode,
      };
    } catch (error) {
      // Handle network errors
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Network error';
      
      logger.error('apiClient: Network error', { 
        endpoint, 
        error: errorMessage 
      });
      
      return {
        data: null,
        error: errorMessage,
        statusCode: 0, // Network error
      };
    }
  },

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, { method: 'GET', params });
  },

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  },

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    return this.fetch<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  },
};

export default apiClient;