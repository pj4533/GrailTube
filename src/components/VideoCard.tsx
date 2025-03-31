import { Video } from '@/types';
import { formatDate } from '@/lib/utils';
import styles from '@/lib/styles';
import VideoThumbnail from './VideoThumbnail';
import SaveVideoButton from './SaveVideoButton';

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

/**
 * Card component for displaying video information
 * Uses extracted components for thumbnails and save buttons
 */
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
  return (
    <div className={styles.card.base} data-testid={`video-card-${video.id}`}>
      <div className="relative">
        <VideoThumbnail
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          onClick={() => onClick(video.id)}
        />
        
        {showSaveButton && (
          <SaveVideoButton
            videoId={video.id}
            isSaved={isSaved}
            onSave={onSave}
            onRemove={onRemove}
            video={video}
            className="absolute top-2 right-2"
          />
        )}
      </div>
      
      <div 
        className={styles.card.content}
        onClick={() => onClick(video.id)}
      >
        <h3 className={styles.card.title}>{video.title}</h3>
        <p className={styles.card.subtitle}>{video.channelTitle}</p>
        
        <div className={styles.card.metaGrid}>
          <span>{formatDate(video.publishedAt)}</span>
          {/* Only show view count for search results, not saved videos */}
          {!discoveredAt && <span>{video.viewCount} views</span>}
        </div>
        
        {/* Show discovery info for saved videos */}
        {discoveredAt && (
          <div className={styles.card.metaSection}>
            <p>Discovered: {new Date(discoveredAt).toLocaleDateString()}</p>
            <p>Views when discovered: {viewCountAtDiscovery || 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}