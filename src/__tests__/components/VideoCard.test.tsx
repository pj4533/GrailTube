import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoCard from '@/components/VideoCard';
import { formatDate } from '@/lib/utils';

// Mock the formatDate function
jest.mock('@/lib/utils', () => ({
  formatDate: jest.fn((date) => 'Formatted date')
}));

// Mock the Image component from next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // Convert boolean attributes to strings to avoid React warnings
    const safeProps = {...props};
    if (props.fill === true) safeProps.fill = "true";
    if (props.unoptimized === true) safeProps.unoptimized = "true";
    
    // eslint-disable-next-line @next/next/no-img-element
    return <img 
      {...safeProps} 
      src={props.src} 
      alt={props.alt} 
      style={{ objectFit: props.className?.includes('object-cover') ? 'cover' : 'initial' }} 
    />;
  }
}));

describe('VideoCard Component', () => {
  const mockVideo = {
    id: 'test-video-id',
    title: 'Test Video Title',
    description: 'Test video description',
    thumbnailUrl: 'https://example.com/thumbnail.jpg',
    channelTitle: 'Test Channel',
    publishedAt: '2023-01-01T00:00:00Z',
    viewCount: 100
  };

  const mockOnClick = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(true);
  const mockOnRemove = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video information correctly', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
    
    expect(screen.getByText(mockVideo.title)).toBeInTheDocument();
    expect(screen.getByText(mockVideo.channelTitle)).toBeInTheDocument();
    expect(screen.getByText(`${mockVideo.viewCount} views`)).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalledWith(mockVideo.publishedAt);
    expect(screen.getByAltText(mockVideo.title)).toBeInTheDocument();
  });

  it('calls onClick when clicking the card', () => {
    render(<VideoCard video={mockVideo} onClick={mockOnClick} />);
    
    // Click on the thumbnail area
    fireEvent.click(screen.getByAltText(mockVideo.title));
    expect(mockOnClick).toHaveBeenCalledWith(mockVideo.id);
    
    // Reset mock
    mockOnClick.mockClear();
    
    // Click on the details area
    fireEvent.click(screen.getByText(mockVideo.title));
    expect(mockOnClick).toHaveBeenCalledWith(mockVideo.id);
  });

  it('shows save button when showSaveButton is true', () => {
    render(
      <VideoCard 
        video={mockVideo} 
        onClick={mockOnClick} 
        onSave={mockOnSave}
        showSaveButton={true}
      />
    );
    
    const saveButton = screen.getByRole('button');
    expect(saveButton).toBeInTheDocument();
  });

  it('calls onSave when clicking the save button', async () => {
    render(
      <VideoCard 
        video={mockVideo} 
        onClick={mockOnClick} 
        onSave={mockOnSave}
        showSaveButton={true}
      />
    );
    
    const saveButton = screen.getByRole('button');
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(mockVideo);
    
    // Verify the onClick doesn't bubble up
    expect(mockOnClick).not.toHaveBeenCalled();
    
    // Wait for saving to complete
    await waitFor(() => {
      expect(saveButton).not.toHaveAttribute('disabled');
    });
  });

  it('calls onRemove when clicking the remove button for a saved video', async () => {
    render(
      <VideoCard 
        video={mockVideo} 
        onClick={mockOnClick} 
        onRemove={mockOnRemove}
        showSaveButton={true}
        isSaved={true}
      />
    );
    
    const removeButton = screen.getByRole('button');
    fireEvent.click(removeButton);
    
    expect(mockOnRemove).toHaveBeenCalledWith(mockVideo.id);
    expect(mockOnClick).not.toHaveBeenCalled();
    
    // Wait for saving to complete
    await waitFor(() => {
      expect(removeButton).not.toHaveAttribute('disabled');
    });
  });

  it('renders discovery information for saved videos', () => {
    const discoveryDate = '2023-01-15T00:00:00Z';
    const viewsAtDiscovery = 5;
    
    render(
      <VideoCard 
        video={mockVideo} 
        onClick={mockOnClick} 
        isSaved={true}
        discoveredAt={discoveryDate}
        viewCountAtDiscovery={viewsAtDiscovery}
      />
    );
    
    expect(screen.getByText(`Discovered: ${new Date(discoveryDate).toLocaleDateString()}`)).toBeInTheDocument();
    expect(screen.getByText(`Views when discovered: ${viewsAtDiscovery}`)).toBeInTheDocument();
    
    // Should not show current view count for saved videos
    expect(screen.queryByText(`${mockVideo.viewCount} views`)).not.toBeInTheDocument();
  });

  it('displays a fallback when there is no thumbnail', () => {
    const videoWithoutThumbnail = { ...mockVideo, thumbnailUrl: '' };
    
    render(<VideoCard video={videoWithoutThumbnail} onClick={mockOnClick} />);
    
    expect(screen.getByText('No thumbnail')).toBeInTheDocument();
    expect(screen.queryByAltText(mockVideo.title)).not.toBeInTheDocument();
  });
});