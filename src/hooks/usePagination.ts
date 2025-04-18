import { useCallback } from 'react';
import { PaginationMetadata } from '@/types';

/**
 * Hook to handle pagination operations
 */
export function usePagination(
  page: number,
  setPage: (page: number) => void,
  pagination?: PaginationMetadata
) {
  // Go to next page
  const goToNextPage = useCallback(() => {
    if (pagination?.hasNextPage) {
      setPage(page + 1);
    }
  }, [pagination?.hasNextPage, page, setPage]);

  // Go to previous page
  const goToPrevPage = useCallback(() => {
    if (pagination?.hasPrevPage) {
      setPage(page - 1);
    }
  }, [pagination?.hasPrevPage, page, setPage]);

  // Go to specific page
  const goToPage = useCallback((pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (pagination?.totalPages || 1)) {
      setPage(pageNum);
    }
  }, [pagination?.totalPages, setPage]);

  return {
    goToNextPage,
    goToPrevPage,
    goToPage
  };
}