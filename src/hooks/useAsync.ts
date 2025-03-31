import { useState, useCallback, useEffect, useRef } from 'react';
import logger from '@/lib/logger';

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
  
  // Set up the mounted ref and cleanup function
  useEffect(() => {
    // Set to true when the effect runs (component mounts)
    isMounted.current = true;
    
    // Return cleanup function to set to false when component unmounts
    return () => {
      logger.debug('useAsync: Component unmounting, setting isMounted to false');
      isMounted.current = false;
    };
  }, []);

  // Create a ref for the immediate value too
  const immediateRef = useRef(immediate);
  useEffect(() => {
    immediateRef.current = immediate;
  }, [immediate]);

  // Function to execute the async operation - uses stable refs instead of direct dependencies
  const execute = useCallback(async () => {
    if (!isMounted.current) {
      logger.debug('useAsync: execute called but component is unmounted');
      return;
    }
    
    logger.debug('useAsync: Starting execution', { 
      immediate: immediateRef.current 
    });
    setState(prevState => ({ ...prevState, isLoading: true, error: null }));

    try {
      // Use the current ref value to call the async function
      logger.time('asyncFunction');
      const response = await asyncFunctionRef.current();
      logger.timeEnd('asyncFunction');
      
      if (isMounted.current) {
        logger.debug('useAsync: Success, updating state');
        setState({ data: response, isLoading: false, error: null });
        onSuccessRef.current(response);
      } else {
        logger.debug('useAsync: Success, but component unmounted');
      }
      return response;
    } catch (error) {
      if (!isMounted.current) {
        logger.debug('useAsync: Error occurred but component unmounted');
        return Promise.reject(error);
      }
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      logger.error('useAsync: Error in execution', { error: errorMessage });
      setState({ data: null, isLoading: false, error: errorMessage });
      onErrorRef.current(error as Error);
      return Promise.reject(error);
    }
  }, []); // Empty dependency array for stable reference - refs handle values

  // Run immediately if option is set
  // Use a ref to track if we've already run the immediate execution
  const hasRunImmediate = useRef(false);
  
  useEffect(() => {
    // Reset the hasRunImmediate when component unmounts so it will run again if remounted
    return () => {
      hasRunImmediate.current = false;
    };
  }, []);
  
  useEffect(() => {
    logger.debug('useAsync: useEffect for immediate execution triggered', { 
      immediate, 
      hasRunBefore: hasRunImmediate.current,
      isMounted: isMounted.current 
    });
    
    // Only run if:
    // 1. Component is mounted
    // 2. immediate option is true
    // 3. We haven't already run the immediate execution
    if (isMounted.current && immediate && !hasRunImmediate.current) {
      logger.debug('useAsync: Running immediate execution');
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