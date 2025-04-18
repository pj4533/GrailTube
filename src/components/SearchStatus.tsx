import { TimeWindow, Video, ViewStats } from '@/types';
import { formatTimeWindow } from '@/lib/utils';
import { Icon } from './ui/Icon';
import LoadingIndicator from './ui/LoadingIndicator';
import ErrorDisplay from './ui/ErrorDisplay';
import Button from './ui/Button';

interface SearchStatusProps {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
  viewStats: ViewStats | null;
  onCancelSearch?: () => void;
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
  onCancelSearch
}: SearchStatusProps) {
  return (
    <>
      {currentWindow && (
        <div className="text-center mb-8">
          {!isLoading && videos.length > 0 ? (
            <p className="text-gray-600">
              Found {videos.length} unedited videos uploaded during{' '}
              <span className="font-semibold">
                {formatTimeWindow(currentWindow)}
              </span>
              {' '}(sorted by view count)
            </p>
          ) : (
            <p className="text-gray-600">
              Searching for unedited videos in{' '}
              <span className="font-semibold">{formatTimeWindow(currentWindow)}</span>
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
        <div className="flex flex-col items-center">
          <LoadingIndicator className="my-8" size="lg" />
          {onCancelSearch && (
            <Button 
              variant="danger" 
              size="md" 
              onClick={onCancelSearch}
              className="mt-4"
              icon={<Icon.Close className="h-4 w-4" />}
            >
              Cancel Search
            </Button>
          )}
        </div>
      )}
    </>
  );
}