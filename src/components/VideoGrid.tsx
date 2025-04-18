import { SavedVideo, Video } from '@/types';
import VideoCard from './VideoCard';
import EmptyState from './ui/EmptyState';
import { adaptSavedVideoToVideo, isSavedVideo } from '@/lib/videoAdapter';

interface VideoGridProps {
  videos: Video[] | SavedVideo[];
  onVideoClick: (videoId: string) => void;
  onSaveVideo?: (video: Video) => Promise<boolean>;
  onRemoveVideo?: (videoId: string) => Promise<boolean>;
  isVideoSaved?: (videoId: string) => boolean;
  showSaveButtons?: boolean;
  isSavedVideosView?: boolean;
}

/**
 * Displays a grid of videos, handling both regular Video and SavedVideo types
 */
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
      <EmptyState 
        message={
          isSavedVideosView 
            ? "No videos have been saved yet. Find some rare gems!"
            : "No videos found. Try another search timeframe!"
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => {
        // Determine if it's a saved video and adapt accordingly
        const videoIsSaved = isSavedVideo(video);
        
        // Convert to standard Video format if needed
        const videoForCard: Video = videoIsSaved
          ? adaptSavedVideoToVideo(video)
          : video as Video;
        
        const videoId = videoIsSaved ? video.video_id : (video as Video).id;
        const savedStatus = isVideoSaved ? isVideoSaved(videoId) : videoIsSaved;
        
        return (
          <VideoCard 
            key={videoId} 
            video={videoForCard} 
            onClick={onVideoClick} 
            onSave={onSaveVideo}
            onRemove={onRemoveVideo}
            isSaved={savedStatus}
            showSaveButton={showSaveButtons}
            discoveredAt={videoIsSaved ? video.discovered_at : undefined}
            viewCountAtDiscovery={videoIsSaved ? video.view_count_at_discovery : undefined}
          />
        );
      })}
    </div>
  );
}