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
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">GrailTube</h1>
              <p className="ml-4 text-sm hidden md:block text-gray-300">
                Discover rare YouTube videos with &lt;10 views
              </p>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-1">
              <button
                onClick={handleBackToSaved}
                className={`px-4 py-2 rounded-md transition-colors ${
                  appMode === 'savedVideos'
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                Saved Videos
              </button>
              
              <button
                onClick={handleStartSearch}
                disabled={isSearchLoading}
                className={`px-4 py-2 rounded-md transition-colors ${
                  appMode === 'search'
                    ? 'bg-red-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800'
                } ${isSearchLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSearchLoading ? 'Searching...' : 'Find Videos'}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
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
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Recently Discovered Videos</h2>
            <VideoGrid 
              videos={searchResults} 
              onVideoClick={handleVideoClick} 
              onSaveVideo={saveVideo}
              isVideoSaved={isVideoSaved}
              showSaveButtons={true}
            />
            
            {/* Search results count */}
            <div className="mt-4 text-sm text-gray-500">
              Found {searchResults.length} videos with less than 10 views
            </div>
          </div>
        )}

        {/* Show saved videos */}
        {appMode === 'savedVideos' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Community Saved Videos</h2>
            {isSavedVideosLoading ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Loading saved videos...</p>
              </div>
            ) : savedVideosError ? (
              <div className="text-center py-10">
                <p className="text-red-500">{savedVideosError}</p>
              </div>
            ) : savedVideos.length === 0 ? (
              <div className="text-center py-10 bg-gray-100 rounded-lg">
                <p className="text-gray-500">No videos have been saved yet. Click "Find Videos" to discover rare gems!</p>
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

        {/* API Stats Display - only show in search mode */}
        {appMode === 'search' && (apiStats.totalApiCalls > 0 || apiStats.cachedSearches > 0 || apiStats.cachedVideoDetails > 0) && (
          <div className="mt-8 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-sm font-semibold mb-2 text-gray-700">API Statistics</h3>
            <ApiStatsDisplay 
              searchApiCalls={apiStats.searchApiCalls}
              videoDetailApiCalls={apiStats.videoDetailApiCalls}
              totalApiCalls={apiStats.totalApiCalls}
              cachedSearches={apiStats.cachedSearches}
              cachedVideoDetails={apiStats.cachedVideoDetails}
            />
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>GrailTube - Discover rare YouTube videos with less than 10 views</p>
        </div>
      </footer>

      {/* Video player modal */}
      {selectedVideoId && (
        <VideoPlayer videoId={selectedVideoId} onClose={handleClosePlayer} />
      )}
    </div>
  );
}