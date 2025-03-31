import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoMetadata from '@/components/VideoMetadata';
import { formatDate, formatDuration } from '@/lib/utils';

// Mock the utils functions
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn(() => 'January 1, 2023'),
  formatDuration: jest.fn(() => '2:30')
}));

describe('VideoMetadata Component', () => {
  const mockVideo = {
    id: 'test-id',
    title: 'Test Video Title',
    description: 'This is a test description for the video.',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    channelTitle: 'Test Channel',
    publishedAt: '2023-01-01T00:00:00Z',
    viewCount: 0,
    duration: 'PT2M30S'
  };

  const mockOnNextVideo = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video title and channel information', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    expect(screen.getByText(mockVideo.channelTitle)).toBeInTheDocument();
  });

  it('displays formatted date and duration', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    expect(formatDate).toHaveBeenCalledWith(mockVideo.publishedAt);
    expect(formatDuration).toHaveBeenCalledWith(mockVideo.duration);
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('2:30')).toBeInTheDocument();
  });

  it('displays "0 views" for the view count', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    expect(screen.getByText('0 views')).toBeInTheDocument();
  });

  it('displays video description', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    expect(screen.getByText(mockVideo.description)).toBeInTheDocument();
  });

  it('displays "No description available" when description is empty', () => {
    const videoWithoutDescription = {
      ...mockVideo,
      description: ''
    };
    
    render(
      <VideoMetadata 
        video={videoWithoutDescription} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('shows next video button when hasMoreVideos is true', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={true} 
      />
    );
    
    const nextButton = screen.getByRole('button', { name: /next untouched video/i });
    expect(nextButton).toBeInTheDocument();
    
    // Test button click
    fireEvent.click(nextButton);
    expect(mockOnNextVideo).toHaveBeenCalledTimes(1);
  });

  it('hides next video button when hasMoreVideos is false', () => {
    render(
      <VideoMetadata 
        video={mockVideo} 
        onNextVideo={mockOnNextVideo} 
        hasMoreVideos={false} 
      />
    );
    
    expect(screen.queryByRole('button', { name: /next untouched video/i })).not.toBeInTheDocument();
  });
});