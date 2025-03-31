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
  
  // Color classes based on search type
  let colorClasses = '';
  switch(searchType) {
    case SearchType.RandomTime:
      colorClasses = 'bg-indigo-100 text-indigo-800';
      break;
    case SearchType.Unedited:
      colorClasses = 'bg-emerald-100 text-emerald-800';
      break;
    case SearchType.Keyword:
      colorClasses = 'bg-amber-100 text-amber-800';
      break;
    default:
      colorClasses = 'bg-indigo-100 text-indigo-800';
  }
  
  // Choose the appropriate icon based on search type
  let IconComponent;
  switch(searchType) {
    case SearchType.RandomTime:
      IconComponent = Icon.Clock;
      break;
    case SearchType.Unedited:
      IconComponent = Icon.Camera;
      break;
    case SearchType.Keyword:
      IconComponent = Icon.Search;
      break;
    default:
      IconComponent = Icon.Clock;
  }
  
  // Get label text based on search type
  let labelText;
  switch(searchType) {
    case SearchType.RandomTime:
      labelText = 'Random Time';
      break;
    case SearchType.Unedited:
      labelText = 'Unedited Videos';
      break;
    case SearchType.Keyword:
      labelText = 'Keyword Search';
      break;
    default:
      labelText = 'Random Time';
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`}>
      <IconComponent className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {labelText}
    </span>
  );
};

export default SearchTypeIndicator;