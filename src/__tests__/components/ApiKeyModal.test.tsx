import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ApiKeyModal from '@/components/ApiKeyModal';
import useYouTubeApiKey from '@/hooks/useYouTubeApiKey';

// Mock the useYouTubeApiKey hook
jest.mock('@/hooks/useYouTubeApiKey', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('ApiKeyModal Component', () => {
  const mockOnClose = jest.fn();
  const mockSetApiKey = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with empty input by default without clear button', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Check modal title and input
    expect(screen.getByText(/add youtube api key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your youtube api key/i)).toHaveValue('');
    
    // Check save and cancel buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    
    // Clear button should not be present when there's no stored key
    expect(screen.queryByRole('button', { name: /clear key/i })).not.toBeInTheDocument();
  });

  it('renders the modal with existing key and clear button if available', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: 'existing-api-key',
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Check that input has existing value
    expect(screen.getByLabelText(/your youtube api key/i)).toHaveValue('existing-api-key');
    
    // Clear button should be present when there's a stored key
    expect(screen.getByRole('button', { name: /clear key/i })).toBeInTheDocument();
  });

  it('calls onClose when clicking the close button', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Click the close button (X in top-right)
    fireEvent.click(screen.getByLabelText(/close/i));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the cancel button', () => {
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Click the cancel button
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('saves the API key, shows success message, and closes the modal when form is submitted', async () => {
    // Mock setTimeout
    jest.useFakeTimers();
    
    // Mock window.location.reload
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Enter a value in the input
    const input = screen.getByLabelText(/your youtube api key/i);
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that API key was saved with the trimmed value
    expect(mockSetApiKey).toHaveBeenCalledWith('new-api-key');
    
    // Check that success message is shown
    expect(screen.getByText(/api key saved successfully/i)).toBeInTheDocument();
    
    // Check that modal was closed
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    // Fast-forward timer
    jest.runAllTimers();
    
    // Check that page reload was called
    expect(reloadMock).toHaveBeenCalledTimes(1);
    
    // Restore timers
    jest.useRealTimers();
  });

  it('trims whitespace from the API key before saving', async () => {
    // Mock setTimeout and window.location.reload
    jest.useFakeTimers();
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true
    });
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Enter a value with whitespace in the input
    const input = screen.getByLabelText(/your youtube api key/i);
    fireEvent.change(input, { target: { value: '  new-api-key  ' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that API key was saved with the trimmed value
    expect(mockSetApiKey).toHaveBeenCalledWith('new-api-key');
    
    // Restore timers
    jest.useRealTimers();
  });

  it('saves null if the API key is empty', async () => {
    // Mock setTimeout and window.location.reload
    jest.useFakeTimers();
    Object.defineProperty(window, 'location', {
      value: { reload: jest.fn() },
      writable: true
    });
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: 'existing-key',
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Clear the input
    const input = screen.getByLabelText(/your youtube api key/i);
    fireEvent.change(input, { target: { value: '' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check that API key was saved as null
    expect(mockSetApiKey).toHaveBeenCalledWith(null);
    
    // Restore timers
    jest.useRealTimers();
  });

  it('handles error when trying to save API key', async () => {
    // Mock a failed save
    const mockFailedSetApiKey = jest.fn().mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: null,
      setApiKey: mockFailedSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Mock console.error to prevent test output clutter
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Enter a value in the input
    const input = screen.getByLabelText(/your youtube api key/i);
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Check error message
    expect(await screen.findByText(/failed to save api key/i)).toBeInTheDocument();
    
    // Modal should not be closed
    expect(mockOnClose).not.toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('clears the API key and refreshes the page when clicking Clear Key', async () => {
    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    
    // Mock setTimeout
    jest.useFakeTimers();
    
    // Mock window.location.reload
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true
    });
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: 'existing-api-key',
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Click the clear button
    fireEvent.click(screen.getByRole('button', { name: /clear key/i }));
    
    // Confirm dialog should have been shown
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to clear your API key?');
    
    // API key should have been set to null
    expect(mockSetApiKey).toHaveBeenCalledWith(null);
    
    // Success message should be shown
    expect(screen.getByText(/api key cleared/i)).toBeInTheDocument();
    
    // Run the timer to trigger the page reload
    jest.runAllTimers();
    
    // Page should have been reloaded
    expect(reloadMock).toHaveBeenCalledTimes(1);
    
    // Restore mocks
    confirmSpy.mockRestore();
    jest.useRealTimers();
  });
  
  it('does not clear the API key when cancelling the confirmation dialog', () => {
    // Mock window.confirm to return false (user cancels)
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    
    (useYouTubeApiKey as jest.Mock).mockReturnValue({
      apiKey: 'existing-api-key',
      setApiKey: mockSetApiKey
    });

    render(<ApiKeyModal onClose={mockOnClose} />);
    
    // Click the clear button
    fireEvent.click(screen.getByRole('button', { name: /clear key/i }));
    
    // Confirm dialog should have been shown
    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to clear your API key?');
    
    // API key should NOT have been set to null
    expect(mockSetApiKey).not.toHaveBeenCalled();
    
    // No success message should be shown
    expect(screen.queryByText(/api key cleared/i)).not.toBeInTheDocument();
    
    // Restore mocks
    confirmSpy.mockRestore();
  });
});