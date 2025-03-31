import { API_BASE_URL } from './constants';

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

      // Default headers
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Make the fetch request
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Get status code
      const statusCode = response.status;

      // Parse the response
      let data: T | null = null;
      if (statusCode !== 204) { // No content
        try {
          data = await response.json();
        } catch (e) {
          // If not JSON, leave data as null
        }
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data && typeof data === 'object' && 'message' in data
          ? String(data.message)
          : `API error: ${response.status} ${response.statusText}`;
        
        return {
          data: null,
          error: errorMessage,
          statusCode,
        };
      }

      // Return successful response
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