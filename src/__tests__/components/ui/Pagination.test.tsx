import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from '@/components/ui/Pagination';
import { PaginationMetadata } from '@/types';

describe('Pagination', () => {
  const mockOnPageChange = jest.fn();
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render pagination with correct page numbers', () => {
    const pagination: PaginationMetadata = {
      page: 2,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };
    
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Check if it displays the page numbers correctly
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Check if current page is highlighted
    const currentPage = screen.getByText('2');
    expect(currentPage).toHaveClass('bg-blue-600');
    expect(currentPage).toHaveClass('text-white');
  });
  
  it('should call onPageChange when page number is clicked', () => {
    const pagination: PaginationMetadata = {
      page: 2,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };
    
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Click on page 3
    fireEvent.click(screen.getByText('3'));
    
    // Verify onPageChange was called with correct page number
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
  
  it('should call onPageChange when Previous/Next buttons are clicked', () => {
    const pagination: PaginationMetadata = {
      page: 2,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: true
    };
    
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Click on Previous button
    fireEvent.click(screen.getByText('Previous'));
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
    
    // Click on Next button
    fireEvent.click(screen.getByText('Next'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
  
  it('should disable Previous button on first page', () => {
    const pagination: PaginationMetadata = {
      page: 1,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: false
    };
    
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Check if Previous button is disabled
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toHaveClass('cursor-not-allowed');
    
    // Click on Previous button should not trigger onPageChange
    fireEvent.click(prevButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });
  
  it('should disable Next button on last page', () => {
    const pagination: PaginationMetadata = {
      page: 5,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
      hasNextPage: false,
      hasPrevPage: true
    };
    
    render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Check if Next button is disabled
    const nextButton = screen.getByText('Next');
    expect(nextButton).toHaveClass('cursor-not-allowed');
    
    // Click on Next button should not trigger onPageChange
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });
  
  it('should not render pagination when only one page exists', () => {
    const pagination: PaginationMetadata = {
      page: 1,
      limit: 10,
      totalCount: 5,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    };
    
    const { container } = render(<Pagination pagination={pagination} onPageChange={mockOnPageChange} />);
    
    // Check if component doesn't render anything
    expect(container.firstChild).toBeNull();
  });
});