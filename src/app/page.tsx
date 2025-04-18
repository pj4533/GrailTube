'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import VideoPlayer from '@/components/VideoPlayer';
import styles from '@/lib/styles';

// Import extracted components
import AppHeader from '@/components/layout/AppHeader';
import SearchContent from '@/components/layout/SearchContent';
import SavedVideosContent from '@/components/layout/SavedVideosContent';
import Footer from '@/components/layout/Footer';

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
    searchType,
    startSearch,
    cancelSearch,
    performReroll
  } = useYouTubeSearch();
  
  // Saved videos hook
  const {
    savedVideos,
    pagination,
    isLoading: isSavedVideosLoading,
    error: savedVideosError,
    saveVideo,
    removeVideo,
    isVideoSaved,
    goToPage
  } = useSavedVideos();

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
  };

  const handleBackToSaved = () => {
    setAppMode('savedVideos');
  };
  
  const handleSwitchToSearch = () => {
    setSelectedVideoId(null);
    setAppMode('search');
    // Automatically start search when tab is clicked
    startSearch();
  };

  // Determine if we found videos in search mode
  const hasFoundVideos = appMode === 'search' && !isSearchLoading && searchResults.length > 0;
  
  // Determine if we're in search mode with no results yet
  const isSearchModeNoResults = appMode === 'search' && (!hasFoundVideos || isSearchLoading);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader 
        appMode={appMode}
        handleBackToSaved={handleBackToSaved}
        handleSwitchToSearch={handleSwitchToSearch}
      />
      
      <main className={`flex-1 ${styles.layout.container} py-6`}>
        {appMode === 'search' && (
          <SearchContent
            isSearchLoading={isSearchLoading}
            searchResults={searchResults}
            currentWindow={currentWindow}
            statusMessage={statusMessage}
            searchError={searchError}
            viewStats={viewStats}
            apiStats={apiStats}
            hasFoundVideos={hasFoundVideos}
            isSearchModeNoResults={isSearchModeNoResults}
            handleVideoClick={handleVideoClick}
            saveVideo={saveVideo}
            isVideoSaved={isVideoSaved}
            cancelSearch={cancelSearch}
            performReroll={performReroll}
          />
        )}

        {appMode === 'savedVideos' && (
          <SavedVideosContent
            savedVideos={savedVideos}
            pagination={pagination}
            isLoading={isSavedVideosLoading}
            error={savedVideosError}
            handleVideoClick={handleVideoClick}
            removeVideo={removeVideo}
            goToPage={goToPage}
          />
        )}
      </main>
      
      <Footer />

      {/* Video player modal */}
      {selectedVideoId && (
        <VideoPlayer videoId={selectedVideoId} onClose={handleClosePlayer} />
      )}
    </div>
  );
}