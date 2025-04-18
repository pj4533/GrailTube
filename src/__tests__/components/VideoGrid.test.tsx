import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoGrid from '@/components/VideoGrid';
import { Video, SavedVideo } from '@/types';
import { adaptSavedVideoToVideo, isSavedVideo } from '@/lib/videoAdapter';

// Mock dependencies
jest.mock('@/components/VideoCard', () => {
  return {
    __esModule: true,
    default: ({ 
      video, 
      onClick, 
      onSave, 
      onRemove, 
      isSaved, 
      showSaveButton,
      discoveredAt,
      viewCountAtDiscovery
    }: any) => (
      <div data-testid="video-card" data-video-id={video.id}>
        <div>{video.title}</div>
        <span data-testid="video-is-saved">{isSaved ? 'Saved' : 'Not Saved'}</span>
        {discoveredAt && <span data-testid="discovered-at">{discoveredAt}</span>}
      </div>
    )
  };
});

jest.mock('@/components/ui/EmptyState', () => {
  return {
    __esModule: true,
    default: ({ message }: any) => (
      <div data-testid="empty-state">{message}</div>
    )
  };
});

jest.mock('@/lib/videoAdapter', () => ({
  adaptSavedVideoToVideo: jest.fn((savedVideo) => ({
    id: savedVideo.video_id,
    title: savedVideo.title,
    description: savedVideo.description,
    thumbnailUrl: savedVideo.thumbnailUrl,
    channelTitle: savedVideo.channelTitle,
    publishedAt: savedVideo.publishedAt,
    viewCount: savedVideo.view_count_at_discovery,
    duration: savedVideo.duration
  })),
  isSavedVideo: jest.fn((video) => 'video_id' in video)
}));

describe('VideoGrid Component', () => {
  // Mock data
  const mockVideos: Video[] = [
    {
      id: 'video1',
      title: 'Test Video 1',
      description: 'Description 1',
      thumbnailUrl: 'https://example.com/thumb1.jpg',
      channelTitle: 'Test Channel',
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
      publishedAt: '2023-01-02T00:00:00Z',
      viewCount: 8,
      duration: 'PT3M45S'
    }
  ];

  const mockSavedVideos: SavedVideo[] = [
    {
      video_id: 'saved1',
      title: 'Saved Video 1',
      description: 'Saved Description 1',
      thumbnailUrl: 'https://example.com/saved1.jpg',
      channelTitle: 'Saved Channel',
      publishedAt: '2023-01-03T00:00:00Z',
      view_count_at_discovery: 3,
      discovered_at: '2023-01-15T00:00:00Z',
      duration: 'PT1M30S',
      viewCount: 3
    },
    {
      video_id: 'saved2',
      title: 'Saved Video 2',
      description: 'Saved Description 2',
      thumbnailUrl: 'https://example.com/saved2.jpg',
      channelTitle: 'Saved Channel',
      publishedAt: '2023-01-04T00:00:00Z',
      view_count_at_discovery: 7,
      discovered_at: '2023-01-16T00:00:00Z',
      duration: 'PT4M15S',
      viewCount: 7
    }
  ];

  const mockHandlers = {
    onVideoClick: jest.fn(),
    onSaveVideo: jest.fn().mockResolvedValue(true),
    onRemoveVideo: jest.fn().mockResolvedValue(true),
    isVideoSaved: jest.fn((videoId) => videoId === 'video1')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays empty state when no videos are provided', () => {
    render(
      <VideoGrid 
        videos={[]} 
        onVideoClick={mockHandlers.onVideoClick} 
      />
    );
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No videos found. Try another search timeframe!')).toBeInTheDocument();
  });

  it('displays empty state with saved videos message when in saved view', () => {
    render(
      <VideoGrid 
        videos={[]} 
        onVideoClick={mockHandlers.onVideoClick}
        isSavedVideosView={true}
      />
    );
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No videos have been saved yet. Find some rare gems!')).toBeInTheDocument();
  });

  it('renders regular videos correctly', () => {
    render(
      <VideoGrid 
        videos={mockVideos} 
        onVideoClick={mockHandlers.onVideoClick} 
        onSaveVideo={mockHandlers.onSaveVideo}
        isVideoSaved={mockHandlers.isVideoSaved}
        showSaveButtons={true}
      />
    );
    
    // Should have 2 video cards
    const videoCards = screen.getAllByTestId('video-card');
    expect(videoCards).toHaveLength(2);
    
    // First video should be marked as saved
    expect(screen.getAllByTestId('video-is-saved')[0]).toHaveTextContent('Saved');
    
    // Second video should not be marked as saved
    expect(screen.getAllByTestId('video-is-saved')[1]).toHaveTextContent('Not Saved');
    
    // Check that isSavedVideo function was called for each video
    expect(isSavedVideo).toHaveBeenCalledTimes(2);
  });

  it('renders saved videos correctly', () => {
    render(
      <VideoGrid 
        videos={mockSavedVideos} 
        onVideoClick={mockHandlers.onVideoClick} 
        onRemoveVideo={mockHandlers.onRemoveVideo}
        showSaveButtons={true}
        isSavedVideosView={true}
      />
    );
    
    // Should have 2 video cards
    const videoCards = screen.getAllByTestId('video-card');
    expect(videoCards).toHaveLength(2);
    
    // Both videos should have discoveredAt data
    const discoveredTags = screen.getAllByTestId('discovered-at');
    expect(discoveredTags).toHaveLength(2);
    
    // Check that adaptSavedVideoToVideo was called for each saved video
    expect(adaptSavedVideoToVideo).toHaveBeenCalledTimes(2);
  });
});