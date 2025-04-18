import { useState, useEffect } from 'react';

// Local storage key for searched year/month combinations
const SEARCHED_DATES_KEY = 'grailtube_searched_dates';

/**
 * Hook to manage searched date combinations
 * Handles local storage persistence and provides helper methods
 */
export function useSearchedDates() {
  // Track searched year/month combinations in state
  const [searchedDates, setSearchedDates] = useState<Set<string>>(new Set());
  
  // Load searched dates from localStorage on component mount
  useEffect(() => {
    try {
      // Handle localStorage access safely for SSR and tests
      if (typeof window !== 'undefined') {
        const savedDates = localStorage.getItem(SEARCHED_DATES_KEY);
        if (savedDates) {
          setSearchedDates(new Set(JSON.parse(savedDates)));
        }
      }
    } catch (error) {
      console.error('Error loading searched dates from localStorage:', error);
      // If there's an error, we'll start with an empty set
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
   * Check if a year-month combination has already been searched
   */
  const hasSearchedDate = (yearMonth: string): boolean => {
    return searchedDates.has(yearMonth);
  };
  
  /**
   * Reset the set of searched dates
   */
  const resetSearchedDates = (): void => {
    setSearchedDates(new Set());
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SEARCHED_DATES_KEY);
      }
    } catch (error) {
      console.error('Error clearing searched dates from localStorage:', error);
    }
  };
  
  /**
   * Get the number of searched dates
   */
  const getSearchedDatesCount = (): number => {
    return searchedDates.size;
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
    addSearchedDate,
    hasSearchedDate,
    resetSearchedDates,
    getSearchedDatesCount,
    getTotalPossibleDates
  };
}