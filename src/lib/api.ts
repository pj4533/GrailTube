/**
 * Common API utilities and error handling
 */

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
  
  if (error instanceof ApiError) {
    return {
      error: error.message,
      status: error.status
    };
  }
  
  return {
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 500
  };
}