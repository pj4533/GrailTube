import { formatDate, formatDuration } from '@/lib/utils';
import { Video } from '@/types';

interface VideoMetadataProps {
  video: Video;
  onNextVideo: () => void;
  hasMoreVideos: boolean;
}

export default function VideoMetadata({ 
  video, 
  onNextVideo,
  hasMoreVideos
}: VideoMetadataProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
      <div className="mb-3">
        <h2 className="text-xl font-bold mb-1 line-clamp-2">{video.title}</h2>
        <p className="text-gray-600 text-sm">{video.channelTitle}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
        <div className="font-semibold">Uploaded:</div>
        <div>{formatDate(video.publishedAt)}</div>
        
        <div className="font-semibold">View Count:</div>
        <div className="text-red-600 font-bold">0 views</div>
        
        <div className="font-semibold">Duration:</div>
        <div>{formatDuration(video.duration)}</div>
      </div>
      
      <div className="text-sm max-h-24 overflow-y-auto mb-3">
        <p className="text-gray-700 whitespace-pre-line">{video.description || 'No description available.'}</p>
      </div>
      
      {hasMoreVideos && (
        <button 
          onClick={onNextVideo}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition-colors"
        >
          Next Untouched Video
        </button>
      )}
    </div>
  );
}