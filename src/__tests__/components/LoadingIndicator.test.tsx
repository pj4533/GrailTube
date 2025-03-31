import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingIndicator from '@/components/ui/LoadingIndicator';

describe('LoadingIndicator Component', () => {
  it('renders without message', () => {
    render(<LoadingIndicator />);
    
    // Check if the spinner element exists
    const spinnerElement = document.querySelector('.animate-spin');
    expect(spinnerElement).toBeInTheDocument();
    
    // Ensure no message is shown
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  it('renders with message', () => {
    const testMessage = 'Loading test data...';
    render(<LoadingIndicator message={testMessage} />);
    
    // Check if the message is displayed
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingIndicator size="sm" />);
    
    // Check small size
    expect(document.querySelector('.animate-spin')).toHaveClass('h-6 w-6');
    
    // Check medium size
    rerender(<LoadingIndicator size="md" />);
    expect(document.querySelector('.animate-spin')).toHaveClass('h-10 w-10');
    
    // Check large size
    rerender(<LoadingIndicator size="lg" />);
    expect(document.querySelector('.animate-spin')).toHaveClass('h-12 w-12');
  });

  it('applies color classes correctly', () => {
    const { rerender } = render(<LoadingIndicator color="primary" />);
    
    // Check primary color
    expect(document.querySelector('.animate-spin')).toHaveClass('border-blue-600');
    
    // Check secondary color
    rerender(<LoadingIndicator color="secondary" />);
    expect(document.querySelector('.animate-spin')).toHaveClass('border-gray-600');
    
    // Check red color
    rerender(<LoadingIndicator color="red" />);
    expect(document.querySelector('.animate-spin')).toHaveClass('border-red-600');
  });

  it('centers when centered prop is true', () => {
    const { container } = render(<LoadingIndicator centered={true} />);
    
    // Check for centering class
    const divElement = container.firstChild as HTMLElement;
    expect(divElement).toHaveClass('flex');
    expect(divElement).toHaveClass('flex-col');
    expect(divElement).toHaveClass('items-center');
    expect(divElement).toHaveClass('justify-center');
  });

  it('does not center when centered prop is false', () => {
    const { container } = render(<LoadingIndicator centered={false} />);
    
    // Should not have centering class
    const divElement = container.firstChild as HTMLElement;
    expect(divElement).not.toHaveClass('flex');
    expect(divElement).not.toHaveClass('flex-col');
    expect(divElement).not.toHaveClass('items-center');
    expect(divElement).not.toHaveClass('justify-center');
  });
});