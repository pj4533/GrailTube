import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

describe('ErrorDisplay Component', () => {
  it('renders the error message correctly', () => {
    const message = 'An error occurred';
    render(<ErrorDisplay message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('applies error variant classes by default', () => {
    const { container } = render(<ErrorDisplay message="Default error" />);
    
    const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
    expect(innerDiv).toHaveClass('text-red-600');
    expect(innerDiv).toHaveClass('bg-red-50');
    expect(innerDiv).toHaveClass('border-red-200');
  });
  
  it('applies warning variant classes when specified', () => {
    const { container } = render(<ErrorDisplay message="Warning message" variant="warning" />);
    
    const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
    expect(innerDiv).toHaveClass('text-yellow-600');
    expect(innerDiv).toHaveClass('bg-yellow-50');
    expect(innerDiv).toHaveClass('border-yellow-200');
  });
  
  it('applies info variant classes when specified', () => {
    const { container } = render(<ErrorDisplay message="Info message" variant="info" />);
    
    const innerDiv = container.querySelector('.rounded-md') as HTMLElement;
    expect(innerDiv).toHaveClass('text-blue-600');
    expect(innerDiv).toHaveClass('bg-blue-50');
    expect(innerDiv).toHaveClass('border-blue-200');
  });
  
  it('centers the message by default', () => {
    const { container } = render(<ErrorDisplay message="Centered message" />);
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass('text-center');
  });
  
  it('does not center the message when centered is false', () => {
    const { container } = render(<ErrorDisplay message="Left-aligned message" centered={false} />);
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).not.toHaveClass('text-center');
  });
  
  it('renders the icon when provided', () => {
    const iconElement = <svg data-testid="test-icon" />;
    
    render(<ErrorDisplay message="Message with icon" icon={iconElement} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
  
  it('applies additional className when provided', () => {
    const customClass = 'my-custom-class';
    
    const { container } = render(<ErrorDisplay message="Custom class message" className={customClass} />);
    
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv).toHaveClass(customClass);
  });
});