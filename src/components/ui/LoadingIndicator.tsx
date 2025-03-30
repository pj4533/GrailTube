import React from 'react';

interface LoadingIndicatorProps {
  message?: string;
  className?: string;
}

/**
 * Standardized loading indicator component
 */
export default function LoadingIndicator({ message, className = '' }: LoadingIndicatorProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mb-4"></div>
      {message && <p className="text-gray-500">{message}</p>}
    </div>
  );
}