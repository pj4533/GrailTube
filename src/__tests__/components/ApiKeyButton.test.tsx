import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApiKeyButton from '@/components/ApiKeyButton';
import useYouTubeApiKey from '@/hooks/useYouTubeApiKey';

// Mock the useYouTubeApiKey hook
jest.mock('@/hooks/useYouTubeApiKey', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('ApiKeyButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default state (no custom key)', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      hasCustomKey: false,
      isLoaded: true
    });

    render(<ApiKeyButton />);
    
    const button = screen.getByRole('button', { name: /add youtube api key/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveClass('text-emerald-400');
  });

  it('renders with green color when a custom key is set', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      hasCustomKey: true,
      isLoaded: true
    });

    render(<ApiKeyButton />);
    
    const button = screen.getByRole('button', { name: /add youtube api key/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('text-emerald-400');
  });

  it('opens the modal when clicked', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      hasCustomKey: false,
      isLoaded: true
    });

    render(<ApiKeyButton />);
    
    // Initially the modal should not be present
    expect(screen.queryByText(/add youtube api key/i)).toBeInTheDocument();
    
    // Click the button
    const button = screen.getByRole('button', { name: /add youtube api key/i });
    fireEvent.click(button);
    
    // Now the modal should be present (check for the title in the modal)
    expect(screen.getByText(/your youtube api key/i)).toBeInTheDocument();
  });
});