import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyState from '@/components/ui/EmptyState';

describe('EmptyState Component', () => {
  it('renders the message correctly', () => {
    const message = 'No items found';
    render(<EmptyState message={message} />);
    
    expect(screen.getByText(message)).toBeInTheDocument();
  });
  
  it('applies additional className when provided', () => {
    const message = 'No results';
    const customClass = 'custom-class';
    
    const { container } = render(<EmptyState message={message} className={customClass} />);
    
    const emptyStateDiv = container.firstChild as HTMLElement;
    expect(emptyStateDiv).toHaveClass('custom-class');
    expect(emptyStateDiv).toHaveClass('text-center');
    expect(emptyStateDiv).toHaveClass('py-10');
    expect(emptyStateDiv).toHaveClass('bg-gray-100');
    expect(emptyStateDiv).toHaveClass('rounded-lg');
  });
});