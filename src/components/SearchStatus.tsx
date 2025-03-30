import { TimeWindow, Video, ViewStats } from '@/types';
import { formatTimeWindow } from '@/lib/utils';

interface SearchStatusProps {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
  viewStats: ViewStats | null;
}

export default function SearchStatus({ 
  isLoading, 
  videos, 
  currentWindow, 
  statusMessage, 
  error,
  viewStats
}: SearchStatusProps) {
  return (
    <>
      {currentWindow && (
        <div className="text-center mb-8">
          {!isLoading && videos.length > 0 ? (
            <p className="text-gray-600">
              Found {videos.length} rare videos (less than 10 views) uploaded during{' '}
              <span className="font-semibold">
                {formatTimeWindow(currentWindow)}
              </span>
            </p>
          ) : (
            <p className="text-gray-600">
              Searching: <span className="font-semibold">{formatTimeWindow(currentWindow)}</span>
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
        <div className="text-center mb-8">
          <p className="text-red-500">{error}</p>
        </div>
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
        <div className="flex justify-center my-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}
    </>
  );
}