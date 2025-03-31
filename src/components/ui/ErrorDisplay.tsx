import React from 'react';

type ErrorVariant = 'error' | 'warning' | 'info';

interface ErrorDisplayProps {
  message: string;
  className?: string;
  variant?: ErrorVariant;
  centered?: boolean;
  icon?: React.ReactNode;
}

/**
 * Standardized error/notification display component
 */
export default function ErrorDisplay({ 
  message, 
  className = '',
  variant = 'error',
  centered = true,
  icon,
}: ErrorDisplayProps) {
  // Variant colors
  const variantClasses = {
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  };
  
  const containerClass = centered ? 'text-center' : '';
  
  return (
    <div className={`${containerClass} py-4 ${className}`}>
      <div className={`inline-block p-3 rounded-md border ${variantClasses[variant]}`}>
        <p className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {message}
        </p>
      </div>
    </div>
  );
}