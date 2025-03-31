import { useState, useCallback, useEffect } from 'react';

interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * A hook for handling asynchronous operations with loading, error, and data states
 */
export function useAsync<T = any>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { 
    immediate = false,
    onSuccess = () => {},
    onError = () => {} 
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });

  // Function to execute the async operation
  const execute = useCallback(async () => {
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      const response = await asyncFunction();
      setState({ data: response, isLoading: false, error: null });
      onSuccess(response);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({ data: null, isLoading: false, error: errorMessage });
      onError(error as Error);
      return Promise.reject(error);
    }
  }, [asyncFunction, onSuccess, onError]);

  // Run immediately if option is set
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  // Reset the state
  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    // Add setters for manual state management if needed
    setData: (data: T) => setState(prev => ({ ...prev, data })),
    setError: (error: string) => setState(prev => ({ ...prev, error })),
    setLoading: (isLoading: boolean) => setState(prev => ({ ...prev, isLoading })),
  };
}

export default useAsync;