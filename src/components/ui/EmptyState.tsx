import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
}

/**
 * Standardized empty state component
 */
export default function EmptyState({ message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-10 bg-gray-100 rounded-lg ${className}`}>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}