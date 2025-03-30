import React from 'react';

interface ErrorDisplayProps {
  message: string;
  className?: string;
}

/**
 * Standardized error display component
 */
export default function ErrorDisplay({ message, className = '' }: ErrorDisplayProps) {
  return (
    <div className={`text-center py-6 ${className}`}>
      <p className="text-red-500">{message}</p>
    </div>
  );
}