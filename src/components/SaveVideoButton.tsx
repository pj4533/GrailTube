import { useState } from 'react';
import { Video } from '@/types';
import { Icon } from './ui/Icon';
import { useAdmin } from '@/hooks/useAdmin';

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
  const { isAdmin } = useAdmin();

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

  // Hide button if video is already saved (on search results screen)
  // Unless user is admin on saved videos view (to show delete button)
  if (isSaved && !(isAdmin && onRemove)) {
    return null;
  }

  // Determine which icon to show (only trash for admin on saved videos)
  const showTrashIcon = isSaved && isAdmin;
  
  const buttonClasses = `
    p-2 rounded-full shadow-md transition-colors duration-200
    ${showTrashIcon 
      ? 'bg-red-500 hover:bg-red-600 text-white' 
      : 'bg-blue-600 hover:bg-blue-700 text-white'}
    ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
    w-10 h-10 flex items-center justify-center
  `;

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={isSaving}
      title={showTrashIcon ? 'Remove from saved videos' : 'Save video'}
      data-testid={`save-button-${videoId}`}
    >
      {showTrashIcon 
        ? <Icon.Trash className="h-5 w-5" /> 
        : <Icon.BookmarkOutline className="h-5 w-5" />
      }
    </button>
  );
}