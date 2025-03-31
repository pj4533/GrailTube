import Image from 'next/image';
import styles from '@/lib/styles';

interface VideoThumbnailProps {
  thumbnailUrl: string | null;
  title: string;
  onClick: () => void;
  className?: string;
}

/**
 * Reusable component for displaying video thumbnails
 * Extracts this logic from VideoCard for better separation of concerns
 */
export default function VideoThumbnail({
  thumbnailUrl,
  title,
  onClick,
  className = ''
}: VideoThumbnailProps) {
  return (
    <div 
      className={`${styles.media.thumbnail} ${className}`}
      onClick={onClick}
      data-testid="video-thumbnail"
    >
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt={title}
          fill={true}
          className="object-cover"
          unoptimized={true}
          data-testid="thumbnail-image"
        />
      ) : (
        <div className={styles.media.thumbnailFallback}>
          <span className={styles.media.thumbnailFallbackText}>No thumbnail</span>
        </div>
      )}
    </div>
  );
}