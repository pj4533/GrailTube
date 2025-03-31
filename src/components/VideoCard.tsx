import Image from 'next/image';
import { useState } from 'react';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils';
import { Icon } from './ui/Icon';

interface VideoCardProps {
  video: Video;
  onClick: (videoId: string) => void;
  onSave?: (video: Video) => Promise<boolean>;
  onRemove?: (videoId: string) => Promise<boolean>;
  isSaved?: boolean;
  showSaveButton?: boolean;
  discoveredAt?: string;
  viewCountAtDiscovery?: number;
}

export default function VideoCard({ 
  video, 
  onClick, 
  onSave, 
  onRemove, 
  isSaved = false,
  showSaveButton = false,
  discoveredAt,
  viewCountAtDiscovery
}: VideoCardProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    if (!onSave && !onRemove) return;
    
    try {
      setIsSaving(true);
      
      if (isSaved && onRemove) {
        await onRemove(video.id);
      } else if (onSave) {
        await onSave(video);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 relative"
    >
      <div 
        className="relative h-48 w-full cursor-pointer"
        onClick={() => onClick(video.id)}
      >
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill={true}
            className="object-cover"
            unoptimized={true} // Try without Next.js optimization
          />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No thumbnail</span>
          </div>
        )}
        {showSaveButton && (
          <button
            className={`absolute top-2 right-2 p-2 rounded-full ${
              isSaved 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white shadow-md transition-colors duration-200 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleSaveClick}
            disabled={isSaving}
          >
{isSaved ? <Icon.Trash className="h-5 w-5" /> : <Icon.BookmarkOutline className="h-5 w-5" />}
          </button>
        )}
      </div>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onClick(video.id)}
      >
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{video.channelTitle}</p>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{formatDate(video.publishedAt)}</span>
          {/* Only show view count for search results, not saved videos */}
          {!discoveredAt && <span>{video.viewCount} views</span>}
        </div>
        
        {/* Show discovery info for saved videos */}
        {discoveredAt && (
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            <p>Discovered: {new Date(discoveredAt).toLocaleDateString()}</p>
            <p>Views when discovered: {viewCountAtDiscovery || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}