import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchStatus from '@/components/SearchStatus';
import { TimeWindow, ViewStats, Video } from '@/types';
import { formatTimeWindow } from '@/lib/utils';

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  formatTimeWindow: jest.fn(() => 'Mock formatted time window')
}));

// Mock SearchTypeIndicator component
jest.mock('@/components/SearchTypeIndicator', () => {
  return {
    __esModule: true,
    default: ({ searchType, size, className }: any) => (
      <span data-testid="search-type-indicator" data-search-type={searchType} className={className}>
        Search Type Indicator
      </span>
    )
  };
});

// Mock LoadingIndicator component
jest.mock('@/components/ui/LoadingIndicator', () => {
  return {
    __esModule: true,
    default: ({ className, size }: any) => (
      <div data-testid="loading-indicator" className={className} data-size={size}>
        Loading Indicator
      </div>
    )
  };
});

// Mock ErrorDisplay component
jest.mock('@/components/ui/ErrorDisplay', () => {
  return {
    __esModule: true,
    default: ({ message, className }: any) => (
      <div data-testid="error-display" className={className}>
        {message}
      </div>
    )
  };
});

describe('SearchStatus Component', () => {
  const mockTimeWindow: TimeWindow = {
    startDate: new Date('2023-01-01T00:00:00Z'),
    endDate: new Date('2023-01-05T00:00:00Z'),
    durationMinutes: 5760 // 4 days in minutes
  };

  const mockVideos: Video[] = [
    {
      id: 'video1',
      title: 'Test Video 1',
      description: 'Description 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      channelTitle: 'Test Channel',
      channelId: 'UC12345',
      publishedAt: '2023-01-01T00:00:00Z',
      viewCount: 5,
      duration: 'PT2M30S'
    },
    {
      id: 'video2',
      title: 'Test Video 2',
      description: 'Description 2',
      thumbnailUrl: 'https://example.com/thumb2.jpg',
      channelTitle: 'Test Channel',
      channelId: 'UC12345',
      publishedAt: '2023-01-02T00:00:00Z',
      viewCount: 8,
      duration: 'PT3M45S'
    }
  ];

  const mockViewStats: ViewStats = {
    totalVideos: 100,
    zeroViews: 10,
    underTenViews: 20,
    underHundredViews: 50,
    underThousandViews: 80
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator when isLoading is true', () => {
    render(
      <SearchStatus
        isLoading={true}
        videos={[]}
        currentWindow={null}
        statusMessage={null}
        error={null}
        viewStats={null}
      />
    );

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('displays time window information when provided', () => {
    render(
      <SearchStatus
        isLoading={false}
        videos={[]}
        currentWindow={mockTimeWindow}
        statusMessage={null}
        error={null}
        viewStats={null}
      />
    );

    expect(formatTimeWindow).toHaveBeenCalledWith(mockTimeWindow);
    expect(screen.getByText(/searching for unedited videos in/i)).toBeInTheDocument();
    expect(screen.getByText('Mock formatted time window')).toBeInTheDocument();
    // SearchTypeIndicator is no longer used in this component
  });

  it('displays search results when videos are found', () => {
    render(
      <SearchStatus
        isLoading={false}
        videos={mockVideos}
        currentWindow={mockTimeWindow}
        statusMessage={null}
        error={null}
        viewStats={null}
      />
    );

    expect(screen.getByText(/found 2 unedited videos/i)).toBeInTheDocument();
    expect(screen.getByText('Mock formatted time window')).toBeInTheDocument();
  });

  it('displays status message when provided and loading', () => {
    const statusMessage = 'Searching for videos...';
    render(
      <SearchStatus
        isLoading={true}
        videos={[]}
        currentWindow={null}
        statusMessage={statusMessage}
        error={null}
        viewStats={null}
      />
    );

    expect(screen.getByText(statusMessage)).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'An error occurred';
    render(
      <SearchStatus
        isLoading={false}
        videos={[]}
        currentWindow={null}
        statusMessage={null}
        error={errorMessage}
        viewStats={null}
      />
    );

    expect(screen.getByTestId('error-display')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('displays video stats when provided and loading', () => {
    render(
      <SearchStatus
        isLoading={true}
        videos={[]}
        currentWindow={null}
        statusMessage={null}
        error={null}
        viewStats={mockViewStats}
      />
    );

    expect(screen.getByText('Video Stats')).toBeInTheDocument();
    expect(screen.getByText('Total videos:')).toBeInTheDocument();
    expect(screen.getByText('0 views:')).toBeInTheDocument();
    expect(screen.getByText('Under 10 views:')).toBeInTheDocument();
    expect(screen.getByText('Under 100 views:')).toBeInTheDocument();
    expect(screen.getByText('Under 1000 views:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // zeroViews
    expect(screen.getByText('20')).toBeInTheDocument(); // underTenViews
    expect(screen.getByText('50')).toBeInTheDocument(); // underHundredViews
    expect(screen.getByText('80')).toBeInTheDocument(); // underThousandViews
    expect(screen.getByText('100')).toBeInTheDocument(); // totalVideos
  });

  it('properly handles unedited videos text', () => {
    render(
      <SearchStatus
        isLoading={false}
        videos={mockVideos}
        currentWindow={mockTimeWindow}
        statusMessage={null}
        error={null}
        viewStats={null}
      />
    );

    expect(screen.getByText(/found 2 unedited videos/i)).toBeInTheDocument();
  });
});