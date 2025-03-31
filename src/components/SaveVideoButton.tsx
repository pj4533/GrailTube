import { useState } from 'react';
import { Video } from '@/types';
import { Icon } from './ui/Icon';
import styles from '@/lib/styles';

interface SaveVideoButtonProps {
  videoId: string;
  isSaved: boolean;
  onSave?: (video: Video) => Promise<boolean>;
  onRemove?: (videoId: string) => Promise<boolean>;
  video?: Video;
  className?: string;
}

/**
 * Reusable button component for saving/removing videos
 * Extracts this logic from VideoCard for better separation of concerns
 */
export default function SaveVideoButton({ 
  videoId,
  isSaved,
  onSave,
  onRemove,
  video,
  className = ''
}: SaveVideoButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events
    
    if ((!onSave && !onRemove) || !video) return;
    
    try {
      setIsSaving(true);
      
      if (isSaved && onRemove) {
        await onRemove(videoId);
      } else if (onSave && video) {
        await onSave(video);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const buttonClasses = `
    ${styles.button.iconButton}
    ${isSaved ? styles.button.removeButton : styles.button.saveButton}
    ${isSaving ? styles.button.disabled : ''}
    ${className}
  `;

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isSaving}
      title={isSaved ? 'Remove from saved videos' : 'Save video'}
      data-testid={`save-button-${videoId}`}
    >
      {isSaved ? <Icon.Trash className="h-5 w-5" /> : <Icon.BookmarkOutline className="h-5 w-5" />}
    </button>
  );
}