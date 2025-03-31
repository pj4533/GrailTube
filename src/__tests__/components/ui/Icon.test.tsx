import React from 'react';
import { render } from '@testing-library/react';
import Icon from '@/components/ui/Icon';

describe('Icon Component', () => {
  // Test each icon to ensure it renders correctly
  const iconComponents = [
    'Search',
    'BookmarkOutline',
    'BookmarkFilled',
    'Clock',
    'Camera',
    'Play',
    'Close',
    'ChevronDown',
    'Trash',
    'Eye',
    'Spinner'
  ];

  iconComponents.forEach(iconName => {
    it(`should render ${iconName} icon with default class`, () => {
      // @ts-ignore - dynamic access to Icon components
      const IconComponent = Icon[iconName];
      const { container } = render(<IconComponent />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Check if default class is applied
      if (iconName === 'Spinner') {
        expect(svg).toHaveClass('h-4 w-4 animate-spin');
      } else {
        expect(svg).toHaveClass('h-4 w-4');
      }
    });

    it(`should render ${iconName} icon with custom class`, () => {
      // @ts-ignore - dynamic access to Icon components
      const IconComponent = Icon[iconName];
      const { container } = render(<IconComponent className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('custom-class');
      expect(svg).not.toHaveClass('h-4 w-4');
    });
  });

  // Test specific icon attributes to ensure correct SVG paths
  it('should render Search icon with correct path', () => {
    const { container } = render(<Icon.Search />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z');
  });

  it('should render BookmarkOutline icon with correct path', () => {
    const { container } = render(<Icon.BookmarkOutline />);
    const path = container.querySelector('path');
    expect(path).toHaveAttribute('d', 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z');
  });

  it('should render Spinner icon with correct circle and path', () => {
    const { container } = render(<Icon.Spinner />);
    const circle = container.querySelector('circle');
    const path = container.querySelector('path');
    
    expect(circle).toHaveAttribute('cx', '12');
    expect(circle).toHaveAttribute('cy', '12');
    expect(circle).toHaveAttribute('r', '10');
    expect(circle).toHaveClass('opacity-25');
    
    expect(path).toHaveAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');
    expect(path).toHaveClass('opacity-75');
  });
});