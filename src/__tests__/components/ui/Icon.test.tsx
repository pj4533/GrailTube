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
    'Spinner',
    'RerollDice'
  ];

  iconComponents.forEach(iconName => {
    it(`should render ${iconName} icon`, () => {
      // @ts-ignore - dynamic access to Icon components
      const IconComponent = Icon[iconName];
      const { container } = render(<IconComponent />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      
      // Check if font awesome class is applied
      expect(svg).toHaveClass('svg-inline--fa');
      
      // Spinner should have animate-spin class
      if (iconName === 'Spinner') {
        expect(svg).toHaveClass('animate-spin');
      }
    });

    it(`should render ${iconName} icon with custom class`, () => {
      // @ts-ignore - dynamic access to Icon components
      const IconComponent = Icon[iconName];
      const { container } = render(<IconComponent className="custom-class" />);
      
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('custom-class');
    });
  });

  // Test specific icon mappings to Font Awesome icons
  it('should render Search icon as magnifying glass', () => {
    const { container } = render(<Icon.Search />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('fa-magnifying-glass');
  });

  it('should render BookmarkOutline icon as bookmark', () => {
    const { container } = render(<Icon.BookmarkOutline />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('fa-bookmark');
  });

  it('should render Spinner icon as spinner', () => {
    const { container } = render(<Icon.Spinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('fa-spinner');
    expect(svg).toHaveClass('animate-spin');
  });
});