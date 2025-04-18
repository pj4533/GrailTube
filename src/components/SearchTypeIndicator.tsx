import React from 'react';
import { Icon } from './ui/Icon';

interface SearchTypeIndicatorProps {
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A simple badge component for displaying the unedited videos search type
 */
export const SearchTypeIndicator: React.FC<SearchTypeIndicatorProps> = ({
  size = 'md',
  className = '',
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <span className={`${baseClasses} ${sizeClasses} ${className}`}>
      <Icon.Camera className={`${iconSize} mr-1`} />
      Unedited Videos
    </span>
  );
};

export default SearchTypeIndicator;