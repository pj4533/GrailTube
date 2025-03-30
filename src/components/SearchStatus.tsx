import { TimeWindow, Video } from '@/types';
import { formatTimeWindow } from '@/lib/utils';

interface SearchStatusProps {
  isLoading: boolean;
  videos: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  error: string | null;
}

export default function SearchStatus({ 
  isLoading, 
  videos, 
  currentWindow, 
  statusMessage, 
  error 
}: SearchStatusProps) {
  return (
    <>
      {currentWindow && (
        <div className="text-center mb-8">
          {!isLoading && videos.length > 0 ? (
            <p className="text-gray-600">
              Found {videos.length} untouched videos (0 views) uploaded during{' '}
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

      {isLoading && (
        <div className="flex justify-center my-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}
    </>
  );
}