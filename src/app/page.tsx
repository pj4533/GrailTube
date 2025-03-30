'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { Video } from '@/types';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';

// Type for app modes
type AppMode = 'savedVideos' | 'search';

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<AppMode>('savedVideos');
  
  // YouTube search hook
  const { 
    isLoading: isSearchLoading, 
    videos: searchResults, 
    currentWindow, 
    statusMessage, 
    error: searchError,
    viewStats,
    apiStats,
    startSearch 
  } = useYouTubeSearch();
  
  // Saved videos hook
  const {
    savedVideos,
    isLoading: isSavedVideosLoading,
    error: savedVideosError,
    saveVideo,
    removeVideo,
    isVideoSaved,
  } = useSavedVideos();

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
  };

  const handleStartSearch = () => {
    setSelectedVideoId(null);
    setAppMode('search');
    startSearch();
  };

  const handleBackToSaved = () => {
    setAppMode('savedVideos');
  };

  // Determine if we found videos in search mode
  const hasFoundVideos = appMode === 'search' && !isSearchLoading && searchResults.length > 0;
  
  // Determine if we're in search mode with no results yet
  const isSearchModeNoResults = appMode === 'search' && (!hasFoundVideos || isSearchLoading);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GrailTube</h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover and save rare YouTube videos with less than 10 views
        </p>
        
        {/* App mode toggle buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={handleStartSearch}
            disabled={isSearchLoading}
            className={`${
              appMode === 'search' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSearchLoading ? 'Searching...' : 'Find Rare Videos'}
          </button>
          
          <button
            onClick={handleBackToSaved}
            disabled={appMode === 'savedVideos'}
            className={`${
              appMode === 'savedVideos' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            My Saved Videos
          </button>
        </div>
      </header>

      {/* Show search status during loading */}
      {isSearchModeNoResults && (
        <SearchStatus
          isLoading={isSearchLoading}
          videos={searchResults}
          currentWindow={currentWindow}
          statusMessage={statusMessage}
          error={searchError}
          viewStats={viewStats}
        />
      )}

      {/* Show search results */}
      {hasFoundVideos && (
        <div className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Videos with less than 10 views</h2>
          <VideoGrid 
            videos={searchResults} 
            onVideoClick={handleVideoClick} 
            onSaveVideo={saveVideo}
            isVideoSaved={isVideoSaved}
            showSaveButtons={true}
          />
        </div>
      )}

      {/* Show saved videos */}
      {appMode === 'savedVideos' && (
        <div className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">My Saved Rare Videos</h2>
          {isSavedVideosLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading your saved videos...</p>
            </div>
          ) : savedVideosError ? (
            <div className="text-center py-10">
              <p className="text-red-500">{savedVideosError}</p>
            </div>
          ) : (
            <VideoGrid 
              videos={savedVideos} 
              onVideoClick={handleVideoClick}
              onRemoveVideo={removeVideo}
              isVideoSaved={() => true}
              showSaveButtons={true}
              isSavedVideosView={true}
            />
          )}
        </div>
      )}

      {/* Video player modal */}
      {selectedVideoId && (
        <VideoPlayer videoId={selectedVideoId} onClose={handleClosePlayer} />
      )}

      {/* API Stats Display - only show in search mode */}
      {appMode === 'search' && (apiStats.totalApiCalls > 0 || apiStats.cachedSearches > 0 || apiStats.cachedVideoDetails > 0) && (
        <ApiStatsDisplay 
          searchApiCalls={apiStats.searchApiCalls}
          videoDetailApiCalls={apiStats.videoDetailApiCalls}
          totalApiCalls={apiStats.totalApiCalls}
          cachedSearches={apiStats.cachedSearches}
          cachedVideoDetails={apiStats.cachedVideoDetails}
        />
      )}

      {/* Show result count in search mode */}
      {hasFoundVideos && (
        <div className="text-center mt-6 text-gray-600">
          <p>Found {searchResults.length} videos with less than 10 views</p>
        </div>
      )}
    </div>
  );
}