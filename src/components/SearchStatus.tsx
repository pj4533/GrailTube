import { TimeWindow, Video, ViewStats, SearchType } from '@/types';
import { formatTimeWindow } from '@/lib/utils';

interface SearchStatusProps {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
  viewStats: ViewStats | null;
  searchType?: SearchType;
}

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
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center ${
                searchType === SearchType.RandomTime 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {searchType === SearchType.RandomTime ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Random Time
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Unedited Videos
                  </>
                )}
              </span>
            </p>
          ) : (
            <p className="text-gray-600">
              Searching for {searchType === SearchType.Unedited ? 'unedited videos' : 'rare videos'} in{' '}
              <span className="font-semibold">{formatTimeWindow(currentWindow)}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center ${
                searchType === SearchType.RandomTime 
                  ? 'bg-indigo-100 text-indigo-800' 
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {searchType === SearchType.RandomTime ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Random Time
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    Unedited Videos
                  </>
                )}
              </span>
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