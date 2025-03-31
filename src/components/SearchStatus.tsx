import { TimeWindow, Video, ViewStats, SearchType } from '@/types';
import { formatTimeWindow } from '@/lib/utils';
import SearchTypeIndicator from './SearchTypeIndicator';
import { Icon } from './ui/Icon';
import LoadingIndicator from './ui/LoadingIndicator';
import ErrorDisplay from './ui/ErrorDisplay';

interface SearchStatusProps {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
  viewStats: ViewStats | null;
  searchType?: SearchType;
}

/**
 * Component to display search status, progress, and statistics
 */
export default function SearchStatus({ 
  isLoading, 
  videos, 
  currentWindow, 
  statusMessage, 
  error,
  viewStats,
  searchType = SearchType.RandomTime
}: SearchStatusProps) {
  return (
    <>
      {currentWindow && (
        <div className="text-center mb-8">
          {!isLoading && videos.length > 0 ? (
            <p className="text-gray-600">
              Found {videos.length} rare {searchType === SearchType.Unedited ? 'unedited ' : ''}videos (less than 10 views) uploaded during{' '}
              <span className="font-semibold">
                {formatTimeWindow(currentWindow)}
              </span>
              <SearchTypeIndicator searchType={searchType} size="sm" className="ml-2" />
            </p>
          ) : (
            <p className="text-gray-600">
              Searching for {searchType === SearchType.Unedited ? 'unedited videos' : 'rare videos'} in{' '}
              <span className="font-semibold">{formatTimeWindow(currentWindow)}</span>
              <SearchTypeIndicator searchType={searchType} size="sm" className="ml-2" />
            </p>
          )}
        </div>
      )}

      {statusMessage && isLoading && (
        <div className="text-center mb-4">
          <p className="text-blue-600">{statusMessage}</p>
        </div>
      )}

      {error && (
        <ErrorDisplay message={error} className="text-center mb-8" />
      )}
      
      {viewStats && isLoading && (
        <div className="text-center mb-4 bg-gray-100 p-4 rounded-lg max-w-lg mx-auto">
          <h3 className="font-medium text-gray-700 mb-2">Video Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-right text-gray-600">Total videos:</div>
            <div className="text-left font-medium">{viewStats.totalVideos}</div>
            
            <div className="text-right text-gray-600">0 views:</div>
            <div className="text-left font-medium">{viewStats.zeroViews}</div>
            
            <div className="text-right text-gray-600">Under 10 views:</div>
            <div className="text-left font-medium">{viewStats.underTenViews}</div>
            
            <div className="text-right text-gray-600">Under 100 views:</div>
            <div className="text-left font-medium">{viewStats.underHundredViews}</div>
            
            <div className="text-right text-gray-600">Under 1000 views:</div>
            <div className="text-left font-medium">{viewStats.underThousandViews}</div>
          </div>
        </div>
      )}

      {isLoading && (
        <LoadingIndicator className="my-16" size="lg" />
      )}
    </>
  );
}