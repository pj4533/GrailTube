import React from 'react';
import { render, screen } from '@testing-library/react';
import YouTubeEmbed from '@/components/YouTubeEmbed';

describe('YouTubeEmbed Component', () => {
  const videoId = 'test-video-id';
  
  it('renders iframe with correct video URL', () => {
    render(<YouTubeEmbed videoId={videoId} />);
    
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', `https://www.youtube.com/embed/${videoId}?rel=0`);
  });
  
  it('adds autoplay parameter when autoplay is enabled', () => {
    render(<YouTubeEmbed videoId={videoId} autoplay={true} />);
    
    const iframe = screen.getByTitle('YouTube video player');
    expect(iframe).toHaveAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
    expect(iframe).toHaveAttribute('allow', expect.stringContaining('autoplay;'));
  });
  
  it('uses provided title', () => {
    const customTitle = 'Custom video player';
    render(<YouTubeEmbed videoId={videoId} title={customTitle} />);
    
    const iframe = screen.getByTitle(customTitle);
    expect(iframe).toBeInTheDocument();
  });
  
  it('passes className to the container div', () => {
    const customClass = 'custom-class';
    const { container } = render(<YouTubeEmbed videoId={videoId} className={customClass} />);
    
    const containerDiv = container.firstChild as HTMLElement;
    expect(containerDiv).toHaveClass(customClass);
  });
  
  it('defaults to allowing fullscreen', () => {
    render(<YouTubeEmbed videoId={videoId} />);
    
    const iframe = screen.getByTitle('YouTube video player');
    // In the DOM, boolean attributes like allowFullScreen are just present (not with value "true")
    expect(iframe).toHaveAttribute('allowFullScreen');
  });
  
  it('disables fullscreen when allowFullScreen is false', () => {
    render(<YouTubeEmbed videoId={videoId} allowFullScreen={false} />);
    
    const iframe = screen.getByTitle('YouTube video player');
    // In React, false boolean props result in the attribute being removed
    expect(iframe).not.toHaveAttribute('allowFullScreen');
  });
});