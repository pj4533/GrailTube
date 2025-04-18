import { useState, useEffect } from 'react';
import { TimeWindow } from '@/types';

// Local storage keys
const SEARCHED_DATES_KEY = 'grailtube_searched_dates';
const SEARCHED_WINDOWS_KEY = 'grailtube_searched_windows';

/**
 * Interface for storing time window information in a compressed format
 */
interface StoredTimeWindow {
  start: number; // timestamp
  end: number;   // timestamp
}

/**
 * Hook to manage searched date combinations and time windows
 * Handles local storage persistence and provides helper methods
 */
export function useSearchedDates() {
  // Track searched year/month combinations in state
  const [searchedDates, setSearchedDates] = useState<Set<string>>(new Set());
  
  // Track searched time windows in state 
  const [searchedWindows, setSearchedWindows] = useState<StoredTimeWindow[]>([]);
  
  // Load searched dates from localStorage on component mount
  useEffect(() => {
    try {
      // Handle localStorage access safely for SSR and tests
      if (typeof window !== 'undefined') {
        // Load year-month combinations
        const savedDates = localStorage.getItem(SEARCHED_DATES_KEY);
        if (savedDates) {
          setSearchedDates(new Set(JSON.parse(savedDates)));
        }
        
        // Load time windows
        const savedWindows = localStorage.getItem(SEARCHED_WINDOWS_KEY);
        if (savedWindows) {
          setSearchedWindows(JSON.parse(savedWindows));
        }
      }
    } catch (error) {
      console.error('Error loading searched dates from localStorage:', error);
      // If there's an error, we'll start with empty data
    }
  }, []);
  
  // Save searched dates to localStorage whenever it changes
  useEffect(() => {
    if (searchedDates.size > 0) {
      try {
        // Handle localStorage access safely for SSR and tests
        if (typeof window !== 'undefined') {
          // Convert Set to Array before stringifying
          const searchedDatesArray = Array.from(searchedDates);
          localStorage.setItem(SEARCHED_DATES_KEY, JSON.stringify(searchedDatesArray));
        }
      } catch (error) {
        console.error('Error saving searched dates to localStorage:', error);
      }
    }
  }, [searchedDates]);
  
  // Save searched windows to localStorage whenever they change
  useEffect(() => {
    if (searchedWindows.length > 0) {
      try {
        // Handle localStorage access safely for SSR and tests
        if (typeof window !== 'undefined') {
          localStorage.setItem(SEARCHED_WINDOWS_KEY, JSON.stringify(searchedWindows));
        }
      } catch (error) {
        console.error('Error saving searched windows to localStorage:', error);
      }
    }
  }, [searchedWindows]);
  
  /**
   * Add a year-month combination to the set of searched dates
   */
  const addSearchedDate = (yearMonth: string): void => {
    setSearchedDates(prev => {
      const newSet = new Set(prev);
      newSet.add(yearMonth);
      return newSet;
    });
  };
  
  /**
   * Add a time window to the list of searched windows
   */
  const addSearchedWindow = (window: TimeWindow): void => {
    const storedWindow: StoredTimeWindow = {
      start: window.startDate.getTime(),
      end: window.endDate.getTime()
    };
    
    setSearchedWindows(prev => [...prev, storedWindow]);
  };
  
  /**
   * Check if a year-month combination has already been searched
   */
  const hasSearchedDate = (yearMonth: string): boolean => {
    return searchedDates.has(yearMonth);
  };
  
  /**
   * Check if a given time window overlaps with any previously searched windows
   */
  const hasOverlappingWindow = (window: TimeWindow): boolean => {
    const start = window.startDate.getTime();
    const end = window.endDate.getTime();
    
    return searchedWindows.some(storedWindow => {
      // Check for overlap: 
      // (start1 <= end2 && end1 >= start2) means the two intervals overlap
      return (start <= storedWindow.end && end >= storedWindow.start);
    });
  };
  
  /**
   * Reset the set of searched dates and windows
   */
  const resetSearchedDates = (): void => {
    setSearchedDates(new Set());
    setSearchedWindows([]);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SEARCHED_DATES_KEY);
        localStorage.removeItem(SEARCHED_WINDOWS_KEY);
      }
    } catch (error) {
      console.error('Error clearing searched data from localStorage:', error);
    }
  };
  
  /**
   * Get the number of searched dates
   */
  const getSearchedDatesCount = (): number => {
    return searchedDates.size;
  };
  
  /**
   * Get the number of searched time windows
   */
  const getSearchedWindowsCount = (): number => {
    return searchedWindows.length;
  };
  
  /**
   * Get the total number of possible year-month combinations
   * from YouTube's founding (April 2005) to current date
   */
  const getTotalPossibleDates = (): number => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // YouTube founding date: April 2005
    const startYear = 2005;
    const startMonth = 3; // April is month 3 (0-indexed)
    
    // Calculate total months: (years * 12 + months) - (startYear * 12 + startMonth)
    return (currentYear * 12 + currentMonth) - (startYear * 12 + startMonth) + 1;
  };
  
  return {
    searchedDates,
    searchedWindows,
    addSearchedDate,
    addSearchedWindow,
    hasSearchedDate,
    hasOverlappingWindow,
    resetSearchedDates,
    getSearchedDatesCount,
    getSearchedWindowsCount,
    getTotalPossibleDates
  };
}