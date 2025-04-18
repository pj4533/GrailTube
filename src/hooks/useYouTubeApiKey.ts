'use client';

import { useState, useEffect } from 'react';
import { YOUTUBE_API_KEY_STORAGE } from '@/lib/constants';

export function useYouTubeApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem(YOUTUBE_API_KEY_STORAGE) || null;
      setApiKey(savedKey);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error reading API key from localStorage:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save API key to localStorage
  const saveApiKey = (key: string | null) => {
    try {
      if (key) {
        localStorage.setItem(YOUTUBE_API_KEY_STORAGE, key);
      } else {
        localStorage.removeItem(YOUTUBE_API_KEY_STORAGE);
      }
      setApiKey(key);
    } catch (error) {
      console.error('Error saving API key to localStorage:', error);
    }
  };

  return { 
    apiKey, 
    setApiKey: saveApiKey,
    isLoaded,
    hasCustomKey: isLoaded && apiKey !== null
  };
}

export default useYouTubeApiKey;