import React from 'react';
import { render, screen } from '@testing-library/react';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';

describe('ApiStatsDisplay Component', () => {
  const mockStats = {
    searchApiCalls: 5,
    videoDetailApiCalls: 10,
    totalApiCalls: 15
  };

  it('renders all API statistics correctly', () => {
    render(<ApiStatsDisplay {...mockStats} />);
    
    // Check for title
    expect(screen.getByText('YouTube API Usage:')).toBeInTheDocument();
    
    // Check for labels
    expect(screen.getByText('Search API calls:')).toBeInTheDocument();
    expect(screen.getByText('Video detail API calls:')).toBeInTheDocument();
    expect(screen.getByText('Total API calls:')).toBeInTheDocument();
    
    // Check for values
    expect(screen.getByText('5')).toBeInTheDocument(); // searchApiCalls
    expect(screen.getByText('10')).toBeInTheDocument(); // videoDetailApiCalls
    expect(screen.getByText('15')).toBeInTheDocument(); // totalApiCalls
  });

  it('renders zero values correctly', () => {
    const zeroStats = {
      searchApiCalls: 0,
      videoDetailApiCalls: 0,
      totalApiCalls: 0
    };
    
    render(<ApiStatsDisplay {...zeroStats} />);
    
    // Check for values
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(3); // All three stats should be 0
  });
});