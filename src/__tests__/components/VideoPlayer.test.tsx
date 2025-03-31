import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VideoPlayer from '@/components/VideoPlayer';

// Mock dependencies
jest.mock('@/components/ui/Icon', () => ({
  Icon: {
    Close: ({ className }: any) => (
      <span data-testid="close-icon" className={className}>Close Icon</span>
    )
  }
}));

jest.mock('@/components/YouTubeEmbed', () => {
  return {
    __esModule: true,
    default: ({ videoId, autoplay, className }: any) => (
      <div 
        data-testid="youtube-embed" 
        data-video-id={videoId} 
        data-autoplay={autoplay ? 'true' : 'false'}
        className={className}
      >
        YouTube Embed
      </div>
    )
  };
});

describe('VideoPlayer Component', () => {
  const videoId = 'test-video-id';
  const onClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with correct videoId passed to YouTubeEmbed', () => {
    render(<VideoPlayer videoId={videoId} onClose={onClose} />);
    
    const youtubeEmbed = screen.getByTestId('youtube-embed');
    expect(youtubeEmbed).toBeInTheDocument();
    expect(youtubeEmbed).toHaveAttribute('data-video-id', videoId);
  });
  
  it('enables autoplay on the YouTube embed', () => {
    render(<VideoPlayer videoId={videoId} onClose={onClose} />);
    
    const youtubeEmbed = screen.getByTestId('youtube-embed');
    expect(youtubeEmbed).toHaveAttribute('data-autoplay', 'true');
  });
  
  it('calls onClose when close button is clicked', () => {
    render(<VideoPlayer videoId={videoId} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close video player/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  
  it('renders the close icon', () => {
    render(<VideoPlayer videoId={videoId} onClose={onClose} />);
    
    const closeIcon = screen.getByTestId('close-icon');
    expect(closeIcon).toBeInTheDocument();
    expect(closeIcon).toHaveClass('h-6 w-6');
  });
  
  it('renders in fullscreen overlay', () => {
    const { container } = render(<VideoPlayer videoId={videoId} onClose={onClose} />);
    
    const overlay = container.firstChild as HTMLElement;
    expect(overlay).toHaveClass('fixed');
    expect(overlay).toHaveClass('inset-0');
    expect(overlay).toHaveClass('bg-black');
    expect(overlay).toHaveClass('bg-opacity-80');
  });
});