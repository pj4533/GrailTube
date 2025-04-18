import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from '@/lib/styles';
import { YOUTUBE_API_KEY_STORAGE } from '@/lib/constants';
import useYouTubeApiKey from '@/hooks/useYouTubeApiKey';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const { apiKey: storedApiKey, setApiKey: saveApiKey } = useYouTubeApiKey();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load existing API key on mount
  useEffect(() => {
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [storedApiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const trimmedKey = apiKey.trim();
      saveApiKey(trimmedKey || null);
      
      // Show success message briefly before refreshing
      setStatusMessage('API key saved successfully. Refreshing page...');
      
      // Close the modal
      onClose();
      
      // Refresh the page after a short delay to allow the user to see the success message
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError('Failed to save API key. Please try again.');
      console.error('Error saving API key:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add YouTube API Key</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
            disabled={isSubmitting}
          >
            <Icon.Close />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">
              Your YouTube API Key
            </label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={styles.form.input + ' w-full'}
              placeholder="Enter your YouTube API key"
              autoFocus
              disabled={isSubmitting}
            />
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
            {statusMessage && <p className="mt-2 text-green-500 text-sm">{statusMessage}</p>}
            <p className="mt-2 text-gray-400 text-sm">
              Your API key will be stored locally and used for YouTube searches.
              {!apiKey && ' If not provided, the default API key will be used.'}
            </p>
          </div>
          
          <div className="flex justify-between mt-6">
            {/* Left side: Clear button (only shows if there's a stored key) */}
            <div>
              {storedApiKey && (
                <Button 
                  type="button" 
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your API key?')) {
                      saveApiKey(null);
                      setStatusMessage('API key cleared. Refreshing page...');
                      setTimeout(() => {
                        window.location.reload();
                      }, 1000);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  Clear Key
                </Button>
              )}
            </div>
            
            {/* Right side: Cancel and Save buttons */}
            <div className="flex">
              <Button 
                type="button" 
                variant="secondary"
                size="sm"
                className="mr-3"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                size="sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;