import { useRef } from 'react';

/**
 * Hook to manage AbortController for cancellable fetch operations
 */
export function useAbortController() {
  // Use a ref to store the abort controller to maintain reference across renders
  const controllerRef = useRef<AbortController | null>(null);
  
  /**
   * Create a new abort controller
   */
  const createAbortController = (): AbortController => {
    controllerRef.current = new AbortController();
    return controllerRef.current;
  };
  
  /**
   * Get the current abort controller
   */
  const getAbortController = (): AbortController | null => {
    return controllerRef.current;
  };
  
  /**
   * Abort the current controller if it exists
   */
  const abortCurrentController = (): void => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  };
  
  return {
    createAbortController,
    getAbortController,
    abortCurrentController
  };
}