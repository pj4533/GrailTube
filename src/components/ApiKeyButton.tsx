import React, { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import useYouTubeApiKey from '@/hooks/useYouTubeApiKey';
import ApiKeyModal from '@/components/ApiKeyModal';

/**
 * Button to manage YouTube API key
 */
const ApiKeyButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { hasCustomKey, isLoaded } = useYouTubeApiKey();
  
  const handleClick = () => {
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  return (
    <>
      <button
        onClick={handleClick}
        className={`${hasCustomKey 
          ? 'text-emerald-400' 
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400'}`}
        data-testid="api-key-button"
        aria-label="Add YouTube API Key"
      >
        <div className="flex items-center px-2">
          <Icon.Key className="h-5 w-5" />
          <span className="ml-1 text-sm">Add API Key</span>
        </div>
      </button>
      
      {showModal && (
        <ApiKeyModal onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ApiKeyButton;