import { formatDate, formatDuration } from '@/lib/utils';
import { Video } from '@/types';
import Button from './ui/Button';
import styles from '@/lib/styles';

interface VideoMetadataProps {
  video: Video;
  onNextVideo: () => void;
  hasMoreVideos: boolean;
}

/**
 * Component for displaying detailed video metadata
 * Uses the Button component and centralized styles
 */
export default function VideoMetadata({ 
  video, 
  onNextVideo,
  hasMoreVideos
}: VideoMetadataProps) {
  return (
    <div className={styles.layout.panel}>
      <div className="mb-3">
        <h2 className={`${styles.text.subtitle} mb-1 ${styles.text.multiLineTruncate}`}>
          {video.title}
        </h2>
        <p className={`${styles.text.body} ${styles.text.muted}`}>
          {video.channelTitle}
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-y-2 text-sm mb-3">
        <div className="font-semibold">Uploaded:</div>
        <div>{formatDate(video.publishedAt)}</div>
        
        <div className="font-semibold">View Count:</div>
        <div className={`${styles.text.error} font-bold`}>
          {video.viewCount} views
        </div>
        
        <div className="font-semibold">Duration:</div>
        <div>{formatDuration(video.duration)}</div>
      </div>
      
      <div className="text-sm max-h-24 overflow-y-auto mb-3">
        <p className="text-gray-700 whitespace-pre-line">
          {video.description || 'No description available.'}
        </p>
      </div>
      
      {hasMoreVideos && (
        <Button 
          onClick={onNextVideo}
          variant="danger"
          fullWidth
          data-testid="next-video-button"
        >
          Next Untouched Video
        </Button>
      )}
    </div>
  );
}