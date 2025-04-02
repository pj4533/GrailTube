import { PaginationMetadata } from '@/types';

interface PaginationProps {
  pagination: PaginationMetadata;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Pagination component for navigating between pages of results
 */
export default function Pagination({ pagination, onPageChange, className = '' }: PaginationProps) {
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;
  
  if (totalPages <= 1) {
    return null;
  }
  
  // Display page numbers with ellipsis for larger page counts
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        aria-label={`Go to page 1`}
        className={`inline-flex items-center justify-center w-8 h-8 rounded-md 
          ${page === 1 
            ? 'bg-blue-600 text-white font-semibold' 
            : 'text-gray-700 hover:bg-gray-100'}`}
      >
        1
      </button>
    );
    
    // Add ellipsis if needed
    if (page > 3) {
      pages.push(
        <span key="ellipsis-1" className="px-2 text-gray-400">
          ...
        </span>
      );
    }
    
    // Calculate range of page numbers to show
    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last pages (handled separately)
      
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          aria-label={`Go to page ${i}`}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md 
            ${page === i 
              ? 'bg-blue-600 text-white font-semibold' 
              : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis if needed
    if (page < totalPages - 2) {
      pages.push(
        <span key="ellipsis-2" className="px-2 text-gray-400">
          ...
        </span>
      );
    }
    
    // Always show last page
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label={`Go to page ${totalPages}`}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md 
            ${page === totalPages 
              ? 'bg-blue-600 text-white font-semibold' 
              : 'text-gray-700 hover:bg-gray-100'}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div className={`flex items-center justify-center space-x-2 py-4 ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => hasPrevPage && onPageChange(page - 1)}
        disabled={!hasPrevPage}
        aria-label="Go to previous page"
        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm
          ${hasPrevPage 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-gray-400 cursor-not-allowed'}`}
      >
        Previous
      </button>
      
      {/* Page numbers */}
      <div className="flex items-center space-x-1">
        {renderPageNumbers()}
      </div>
      
      {/* Next button */}
      <button
        onClick={() => hasNextPage && onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Go to next page"
        className={`inline-flex items-center justify-center px-3 py-1 rounded-md text-sm
          ${hasNextPage 
            ? 'text-gray-700 hover:bg-gray-100' 
            : 'text-gray-400 cursor-not-allowed'}`}
      >
        Next
      </button>
    </div>
  );
}