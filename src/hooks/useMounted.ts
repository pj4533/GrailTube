import { useEffect, useRef } from 'react';
import logger from '@/lib/logger';

/**
 * Hook to track if a component is mounted
 * Used to prevent state updates after component unmount
 * 
 * @param debugName Optional name for debugging purposes
 * @returns A ref object which holds the current mount state
 */
export function useMounted(debugName?: string) {
  const componentName = debugName || 'Component';
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set to true when the effect runs (component mounts)
    isMounted.current = true;
    logger.debug(`useMounted: ${componentName} mounted`);
    
    // Return cleanup function to set to false when component unmounts
    return () => {
      logger.debug(`useMounted: ${componentName} unmounting`);
      isMounted.current = false;
    };
  }, [componentName]);

  return isMounted;
}

export default useMounted;