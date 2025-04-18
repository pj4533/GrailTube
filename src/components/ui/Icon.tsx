import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faBookmark as faBookmarkSolid, 
  faClock, 
  faCamera, 
  faPlay, 
  faTimes, 
  faChevronDown, 
  faTrash, 
  faEye, 
  faSpinner, 
  faDice, 
  faBookmark,
  faLock,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

interface IconProps {
  className?: string;
}

/**
 * A library of icons used throughout the application using Font Awesome
 */
export const Icon = {
  Search: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faSearch} className={className} />
  ),
  
  BookmarkOutline: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faBookmark} className={className} />
  ),
  
  BookmarkFilled: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faBookmarkSolid} className={className} />
  ),
  
  Clock: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faClock} className={className} />
  ),
  
  Camera: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faCamera} className={className} />
  ),
  
  Play: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faPlay} className={className} />
  ),
  
  Close: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faTimes} className={className} />
  ),
  
  ChevronDown: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faChevronDown} className={className} />
  ),
  
  Trash: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faTrash} className={className} />
  ),
  
  Eye: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faEye} className={className} />
  ),
  
  Spinner: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faSpinner} className={`animate-spin ${className}`} />
  ),

  RerollDice: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faDice} className={className} />
  ),
  
  GitHub: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faGithub} className={className} />
  ),
  
  Lock: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faLock} className={className} />
  ),
  
  Key: ({ className = "" }: IconProps) => (
    <FontAwesomeIcon icon={faKey} className={className} />
  )
};

export default Icon;