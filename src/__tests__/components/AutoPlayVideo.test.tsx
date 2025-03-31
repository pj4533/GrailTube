import React from 'react';
import { render, screen } from '@testing-library/react';
import AutoPlayVideo from '@/components/AutoPlayVideo';
import { Video } from '@/types';

// Mock the child components to simplify testing
jest.mock('@/components/VideoMetadata', () => ({
  __esModule: true,
  default: jest.fn(({ video, onNextVideo, hasMoreVideos }) => (
    <div data-testid="video-metadata">
      <span data-testid="title">{video.title}</span>
      <button 
        data-testid="next-button" 
        onClick={onNextVideo}
        disabled={!hasMoreVideos}
      >
        Next Video
      </button>
    </div>
  ))
}));

jest.mock('@/components/YouTubeEmbed', () => ({
  __esModule: true,
  default: jest.fn(({ videoId, autoplay }) => (
    <div data-testid="youtube-embed">
      <span data-testid="video-id">{videoId}</span>
      <span data-testid="autoplay">{autoplay ? 'true' : 'false'}</span>
    </div>
  ))
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('AutoPlayVideo Component', () => {
  // Test video data
  const mockVideo: Video = {
    id: 'test-video-id',
    title: 'Test Video',
    description: 'This is a test video',
    publishedAt: '2023-01-01T00:00:00Z',
    channelTitle: 'Test Channel',
    viewCount: 5,
    likeCount: 1,
    commentCount: 0,
    thumbnails: {
      default: { url: 'http://example.com/default.jpg', width: 120, height: 90 },
      medium: { url: 'http://example.com/medium.jpg', width: 320, height: 180 },
      high: { url: 'http://example.com/high.jpg', width: 480, height: 360 }
    }
  };

  const onNextVideoMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with video data', () => {
    render(
      <AutoPlayVideo 
        video={mockVideo} 
        onNextVideo={onNextVideoMock} 
        hasMoreVideos={true} 
      />
    );

    // YouTube embed component is rendered
    expect(screen.getByTestId('youtube-embed')).toBeInTheDocument();
    expect(screen.getByTestId('video-id')).toHaveTextContent('test-video-id');
    expect(screen.getByTestId('autoplay')).toHaveTextContent('true');

    // VideoMetadata component is rendered
    expect(screen.getByTestId('video-metadata')).toBeInTheDocument();
    expect(screen.getByTestId('title')).toHaveTextContent('Test Video');
    
    // Button should be enabled when hasMoreVideos is true
    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).not.toBeDisabled();
  });

  it('disables the next button when hasMoreVideos is false', () => {
    render(
      <AutoPlayVideo 
        video={mockVideo} 
        onNextVideo={onNextVideoMock} 
        hasMoreVideos={false} 
      />
    );

    const nextButton = screen.getByTestId('next-button');
    expect(nextButton).toBeDisabled();
  });

  it('calls scrollIntoView when video changes', () => {
    const { rerender } = render(
      <AutoPlayVideo 
        video={mockVideo} 
        onNextVideo={onNextVideoMock} 
        hasMoreVideos={true} 
      />
    );

    // Should be called once on initial render
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start'
    });

    // Update with a new video ID
    const newVideo = { ...mockVideo, id: 'new-video-id' };
    
    rerender(
      <AutoPlayVideo 
        video={newVideo} 
        onNextVideo={onNextVideoMock} 
        hasMoreVideos={true} 
      />
    );

    // Should be called again after video ID change
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledTimes(2);
  });
});