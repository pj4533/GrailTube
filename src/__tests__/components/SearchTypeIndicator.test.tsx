import React from 'react';
import { render, screen } from '@testing-library/react';
import SearchTypeIndicator from '@/components/SearchTypeIndicator';
import { SearchType } from '@/types';
import { Icon } from '@/components/ui/Icon';

// Mock the Icon component
jest.mock('@/components/ui/Icon', () => ({
  Icon: {
    Clock: ({ className }: any) => (
      <span data-testid="clock-icon" className={className}>Clock Icon</span>
    ),
    Camera: ({ className }: any) => (
      <span data-testid="camera-icon" className={className}>Camera Icon</span>
    ),
    Search: ({ className }: any) => (
      <span data-testid="search-icon" className={className}>Search Icon</span>
    )
  }
}));

describe('SearchTypeIndicator Component', () => {
  it('displays "Unedited Videos" text', () => {
    render(<SearchTypeIndicator />);
    
    expect(screen.getByText('Unedited Videos')).toBeInTheDocument();
    expect(screen.getByTestId('camera-icon')).toBeInTheDocument();
  });

  it('applies correct color classes', () => {
    const { container } = render(<SearchTypeIndicator />);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('bg-emerald-100');
    expect(badgeElement).toHaveClass('text-emerald-800');
  });

  it('applies small size classes when size="sm"', () => {
    const { container } = render(<SearchTypeIndicator size="sm" />);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('px-2');
    expect(badgeElement).toHaveClass('py-0.5');
    expect(badgeElement).toHaveClass('text-xs');
    
    const iconElement = screen.getByTestId('camera-icon');
    expect(iconElement).toHaveClass('h-3');
    expect(iconElement).toHaveClass('w-3');
  });

  it('applies medium size classes by default', () => {
    const { container } = render(<SearchTypeIndicator />);
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('px-3');
    expect(badgeElement).toHaveClass('py-1');
    expect(badgeElement).toHaveClass('text-sm');
    
    const iconElement = screen.getByTestId('camera-icon');
    expect(iconElement).toHaveClass('h-4');
    expect(iconElement).toHaveClass('w-4');
  });

  it('applies additional className when provided', () => {
    const { container } = render(
      <SearchTypeIndicator className="ml-2" />
    );
    
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement).toHaveClass('ml-2');
  });
});