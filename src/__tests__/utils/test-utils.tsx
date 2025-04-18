import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AdminProvider } from '@/hooks/useAdmin';

// Create a wrapper with all providers
const AllProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
};

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllProviders, ...options });

// Mock hook responses for testing components
export const createMockUseAsyncResponse = (overrides = {}) => ({
  isLoading: false,
  data: null,
  error: null,
  execute: jest.fn().mockResolvedValue(null),
  reset: jest.fn(),
  setData: jest.fn(),
  setError: jest.fn(),
  setLoading: jest.fn(),
  ...overrides
});

export const createMockUseYouTubeSearchResponse = (overrides = {}) => ({
  isLoading: false,
  videos: [],
  currentWindow: null,
  statusMessage: null,
  error: null,
  viewStats: null,
  apiStats: { searches: 0, videoDetailCalls: 0, totalApiCalls: 0 },
  searchType: 'RANDOM_TIME',
  startSearch: jest.fn(),
  changeSearchType: jest.fn(),
  ...overrides
});

export const createMockUseSavedVideosResponse = (overrides = {}) => ({
  isLoading: false,
  savedVideos: [],
  error: null,
  saveVideo: jest.fn().mockResolvedValue(undefined),
  removeVideo: jest.fn().mockResolvedValue(undefined),
  refreshVideos: jest.fn().mockResolvedValue(undefined),
  ...overrides
});

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };