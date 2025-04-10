import {
  formatDate,
  formatDuration,
  getRandomPastDate,
  formatTimeWindow,
  createInitialTimeWindow,
  delay
} from '@/lib/utils';

import { YOUTUBE_FOUNDING_DATE } from '@/lib/constants';
import { format, addMinutes, subMinutes } from 'date-fns';
import { SearchType } from '@/types';

// Helper functions for testing only
function getWindowCenter(window: { startDate: Date, endDate: Date }): Date {
  return new Date((window.startDate.getTime() + window.endDate.getTime()) / 2);
}

function createTimeWindow(centerTime: Date, durationMinutes: number) {
  const halfDuration = durationMinutes / 2;
  return {
    startDate: subMinutes(centerTime, halfDuration),
    endDate: addMinutes(centerTime, halfDuration),
    durationMinutes
  };
}

describe('Utils', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      // Mock the toLocaleDateString
      const originalToLocaleDateString = Date.prototype.toLocaleDateString;
      Date.prototype.toLocaleDateString = jest.fn(() => 'January 1, 2023');
      
      const result = formatDate('2023-01-01T00:00:00Z');
      expect(result).toBe('January 1, 2023');
      
      // Restore original method
      Date.prototype.toLocaleDateString = originalToLocaleDateString;
    });
  });

  describe('formatDuration', () => {
    it('formats hours, minutes, and seconds correctly', () => {
      expect(formatDuration('PT1H30M15S')).toBe('1:30:15');
    });

    it('formats minutes and seconds correctly (no hours)', () => {
      expect(formatDuration('PT5M30S')).toBe('5:30');
    });

    it('formats only seconds correctly', () => {
      expect(formatDuration('PT45S')).toBe('0:45');
    });

    it('handles undefined duration', () => {
      expect(formatDuration(undefined)).toBe('Unknown');
    });

    it('handles invalid format', () => {
      expect(formatDuration('InvalidFormat')).toBe('Unknown');
    });

    it('pads seconds with leading zeros', () => {
      expect(formatDuration('PT1M5S')).toBe('1:05');
    });

    it('pads minutes with leading zeros when hours present', () => {
      expect(formatDuration('PT1H5M30S')).toBe('1:05:30');
    });
  });

  describe('getRandomPastDate', () => {
    beforeAll(() => {
      // Mock Math.random to return a predictable value
      jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    });

    afterAll(() => {
      // Restore Math.random
      jest.spyOn(global.Math, 'random').mockRestore();
    });

    it('returns a date between YouTube founding and yesterday', () => {
      const result = getRandomPastDate();
      const now = new Date();
      
      // Should be after YouTube founding
      expect(result.getTime()).toBeGreaterThan(YOUTUBE_FOUNDING_DATE.getTime());
      
      // Should be before today
      expect(result.getTime()).toBeLessThan(now.getTime());
    });
  });

  describe('formatTimeWindow', () => {
    it('formats time window correctly', () => {
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-05T00:00:00Z');
      const window = { startDate, endDate, durationMinutes: 5760 };
      
      // Mock format function from date-fns
      const expectedFormattedDate = 'Jan 1, 2023 12:00 AM';
      jest.mock('date-fns', () => ({
        format: jest.fn(() => expectedFormattedDate)
      }));
      
      const result = formatTimeWindow(window);
      expect(result).toContain('96-hour period');
    });
  });

  describe('getWindowCenter', () => {
    it('calculates center time correctly', () => {
      const startDate = new Date('2023-01-01T00:00:00Z');
      const endDate = new Date('2023-01-03T00:00:00Z');
      const window = { startDate, endDate, durationMinutes: 2880 };
      
      const result = getWindowCenter(window);
      const expectedCenter = new Date('2023-01-02T00:00:00Z');
      
      expect(result.getTime()).toBe(expectedCenter.getTime());
    });
  });

  describe('createTimeWindow', () => {
    it('creates time window correctly', () => {
      const centerTime = new Date('2023-01-02T12:00:00Z');
      const durationMinutes = 120; // 2 hours
      
      const result = createTimeWindow(centerTime, durationMinutes);
      
      expect(result.startDate).toEqual(subMinutes(centerTime, 60));
      expect(result.endDate).toEqual(addMinutes(centerTime, 60));
      expect(result.durationMinutes).toBe(durationMinutes);
    });
  });

  describe('createInitialTimeWindow', () => {
    it('creates 1-month time window (43200 minutes) for unedited search', () => {
      const centerDate = new Date('2023-01-15T12:00:00Z');
      
      const result = createInitialTimeWindow(centerDate);
      
      expect(result.durationMinutes).toBe(43200);
      expect(result.startDate).toEqual(subMinutes(centerDate, 43200 / 2));
      expect(result.endDate).toEqual(addMinutes(centerDate, 43200 / 2));
    });

    it('respects the isUnedited parameter (though default is true)', () => {
      const centerDate = new Date('2023-01-15T12:00:00Z');
      
      const result = createInitialTimeWindow(centerDate, true);
      
      expect(result.durationMinutes).toBe(43200);
      expect(result.startDate).toEqual(subMinutes(centerDate, 43200 / 2));
      expect(result.endDate).toEqual(addMinutes(centerDate, 43200 / 2));
    });
  });

  describe('delay', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, 'setTimeout');
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('returns a promise that resolves after specified time', async () => {
      const ms = 1000;
      const promise = delay(ms);
      
      // Promise should not resolve immediately
      const immediateResolve = jest.fn();
      promise.then(immediateResolve);
      expect(immediateResolve).not.toHaveBeenCalled();
      
      // Verify setTimeout was called with correct time
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), ms);
      
      // Fast-forward time
      jest.advanceTimersByTime(ms);
      
      // Wait for promise to resolve
      await promise;
      
      // Schedule a check after the promise resolves
      await Promise.resolve();
      
      // Now the callback should have been called
      expect(immediateResolve).toHaveBeenCalled();
    });
  });
});