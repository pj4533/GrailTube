import { useState, useCallback, useEffect, useRef } from 'react';

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

  // Store the latest asyncFunction and callbacks in refs to avoid dependency changes
  const asyncFunctionRef = useRef(asyncFunction);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Update refs when the functions change
  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [asyncFunction, onSuccess, onError]);

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
  });
  
  // Track if the component is mounted to prevent setState after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to execute the async operation - uses stable refs instead of direct dependencies
  const execute = useCallback(async () => {
    if (!isMounted.current) return;
    
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      // Use the current ref value to call the async function
      const response = await asyncFunctionRef.current();
      
      if (isMounted.current) {
        setState({ data: response, isLoading: false, error: null });
        onSuccessRef.current(response);
      }
      return response;
    } catch (error) {
      if (!isMounted.current) return Promise.reject(error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      setState({ data: null, isLoading: false, error: errorMessage });
      onErrorRef.current(error as Error);
      return Promise.reject(error);
    }
  }, []); // Empty dependency array for stable reference

  // Run immediately if option is set
  // Use a ref to track if we've already run the immediate execution
  const hasRunImmediate = useRef(false);
  
  useEffect(() => {
    if (immediate && !hasRunImmediate.current) {
      hasRunImmediate.current = true;
      execute();
    }
  }, [immediate, execute]);

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