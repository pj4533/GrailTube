import { SavedVideo, Video } from '@/types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  videos: Video[] | SavedVideo[];
  onVideoClick: (videoId: string) => void;
  onSaveVideo?: (video: Video) => Promise<boolean>;
  onRemoveVideo?: (videoId: string) => Promise<boolean>;
  isVideoSaved?: (videoId: string) => boolean;
  showSaveButtons?: boolean;
  isSavedVideosView?: boolean;
}

export default function VideoGrid({ 
  videos, 
  onVideoClick,
  onSaveVideo,
  onRemoveVideo,
  isVideoSaved,
  showSaveButtons = false,
  isSavedVideosView = false
}: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">
          {isSavedVideosView 
            ? "No videos have been saved yet. Find some rare gems!"
            : "No videos with less than 10 views found. Try again!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => {
        // Check if we're dealing with a SavedVideo
        const isSavedVideo = 'video_id' in video;
        
        // For saved videos, we need to adapt the structure to work with VideoCard
        const videoForCard: Video = isSavedVideo 
          ? {
              id: (video as SavedVideo).video_id,
              title: video.title,
              description: video.description,
              thumbnailUrl: video.thumbnailUrl,
              publishedAt: video.publishedAt,
              viewCount: (video as SavedVideo).view_count_at_discovery || 0,
              channelTitle: video.channelTitle,
              duration: video.duration,
            }
          : video as Video;
        
        const videoId = isSavedVideo ? (video as SavedVideo).video_id : (video as Video).id;
        const isSaved = isVideoSaved ? isVideoSaved(videoId) : isSavedVideo;
        
        return (
          <VideoCard 
            key={videoId} 
            video={videoForCard} 
            onClick={onVideoClick} 
            onSave={onSaveVideo}
            onRemove={onRemoveVideo}
            isSaved={isSaved}
            showSaveButton={showSaveButtons}
            discoveredAt={isSavedVideo ? (video as SavedVideo).discovered_at : undefined}
            viewCountAtDiscovery={isSavedVideo ? (video as SavedVideo).view_count_at_discovery : undefined}
          />
        );
      })}
    </div>
  );
}