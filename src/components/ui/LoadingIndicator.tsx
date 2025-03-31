import React from 'react';
import { Icon } from './Icon';

type LoadingSize = 'sm' | 'md' | 'lg';
type LoadingColor = 'primary' | 'secondary' | 'red' | 'blue' | 'gray';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
  size?: LoadingSize;
  color?: LoadingColor;
  centered?: boolean;
}

/**
 * Standardized loading indicator component with size and color variants
 */
export default function LoadingIndicator({ 
  message, 
  className = '',
  size = 'md',
  color = 'red',
  centered = true,
}: LoadingIndicatorProps) {
  // Size variants
  const spinnerSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };
  
  // Color variants
  const spinnerColors = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    red: 'border-red-600',
    blue: 'border-blue-600',
    gray: 'border-gray-500',
  };
  
  const containerClass = centered ? 'flex flex-col items-center justify-center' : '';
  
  return (
    <div className={`${containerClass} py-4 ${className}`}>
      <div className={`animate-spin rounded-full ${spinnerSizes[size]} border-t-2 border-b-2 ${spinnerColors[color]} ${message ? 'mb-4' : ''}`}></div>
      {message && <p className="text-gray-500 text-sm">{message}</p>}
    </div>
  );
}