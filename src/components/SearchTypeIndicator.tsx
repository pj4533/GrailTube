import React from 'react';
import { SearchType } from '@/types';
import { Icon } from './ui/Icon';

interface SearchTypeIndicatorProps {
  searchType: SearchType;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * A component for displaying the current search type with consistent styling
 */
export const SearchTypeIndicator: React.FC<SearchTypeIndicatorProps> = ({
  searchType,
  size = 'md',
  className = '',
}) => {
  // Base classes for the badge
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }[size];
  
  // Always use emerald color for Unedited search type
  const colorClasses = 'bg-emerald-100 text-emerald-800';
  
  // Always use the Camera icon for Unedited search type
  const IconComponent = Icon.Camera;
  
  // Always use "Unedited Videos" label
  const labelText = 'Unedited Videos';

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}>
      <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {labelText}
    </span>
  );
};

export default SearchTypeIndicator;