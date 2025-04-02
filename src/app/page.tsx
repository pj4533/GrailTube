'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { useSavedVideos } from '@/hooks/useSavedVideos';
import { Video, SearchType } from '@/types';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';
import SearchTypeIndicator from '@/components/SearchTypeIndicator';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import EmptyState from '@/components/ui/EmptyState';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import Pagination from '@/components/ui/Pagination';
import styles from '@/lib/styles';
import { formatTimeWindow } from '@/lib/utils';

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
      {/* Top Navigation Bar */}
      <nav className={styles.nav.container}>
        <div className={styles.nav.innerContainer}>
          <div className="flex flex-col">
            {/* Logo and Tabs in same row */}
            <div className="flex items-center justify-between pb-3">
              {/* Left side: Logo and description */}
              <div className="flex items-center">
                <h1 className={styles.text.title}>GrailTube</h1>
                <p className="ml-4 text-sm hidden md:block text-gray-300">
                  Discover rare YouTube videos with &lt;10 views
                </p>
              </div>
              
              {/* Right side: Tab Navigation */}
              <div className="flex">
                <button
                  onClick={handleBackToSaved}
                  className={`${styles.nav.tabBase} -mb-[1px] ${
                    appMode === 'savedVideos'
                      ? styles.nav.tabActive
                      : styles.nav.tabInactive
                  }`}
                  data-testid="saved-videos-tab"
                >
                  <div className="flex items-center">
                    <Icon.BookmarkOutline className="h-4 w-4 mr-2" />
                    <span>Saved Videos</span>
                  </div>
                </button>
                
                <button
                  onClick={handleSwitchToSearch}
                  className={`${styles.nav.tabBase} -mb-[1px] ${
                    appMode === 'search'
                      ? styles.nav.tabActive
                      : styles.nav.tabInactive
                  }`}
                  data-testid="find-videos-tab"
                >
                  <div className="flex items-center">
                    <Icon.Search className="h-4 w-4 mr-2" />
                    <span>Find Videos</span>
                  </div>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className={`flex-1 ${styles.layout.container} py-6`}>
        {/* Show search status during loading or reroll */}
        {(isSearchModeNoResults || isSearchLoading) && (
          <SearchStatus
            isLoading={isSearchLoading}
            videos={searchResults}
            currentWindow={currentWindow}
            statusMessage={statusMessage}
            error={searchError}
            viewStats={viewStats}
            searchType={searchType}
            onCancelSearch={cancelSearch}
          />
        )}

        {/* Show search results */}
        {hasFoundVideos && (
          <div className="mb-8">
            <h2 className={`${styles.layout.sectionHeader} flex items-center justify-between`}>
              <span>Results for {currentWindow && formatTimeWindow(currentWindow)}</span>
              <button
                onClick={() => performReroll()}
                disabled={isSearchLoading}
                className={`rounded-full p-1.5 transition-colors ${isSearchLoading ? 'bg-gray-200 text-gray-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                title="Find different videos"
                data-testid="reroll-button"
              >
                {isSearchLoading ? (
                  <Icon.Spinner className="h-5 w-5" />
                ) : (
                  <Icon.RerollDice className="h-5 w-5" />
                )}
              </button>
            </h2>
            <VideoGrid 
              videos={searchResults} 
              onVideoClick={handleVideoClick} 
              onSaveVideo={saveVideo}
              isVideoSaved={isVideoSaved}
              showSaveButtons={true}
            />
            
            {/* Search results count */}
            <div className="mt-4 text-sm text-gray-500">
              Found {searchResults.length} unedited videos with less than 10 views
            </div>
          </div>
        )}

        {/* Show saved videos */}
        {appMode === 'savedVideos' && (
          <div className="mb-8">
            <h2 className={styles.layout.sectionHeader}>Community Saved Videos</h2>
            {isSavedVideosLoading ? (
              <LoadingIndicator message="Loading saved videos..." />
            ) : savedVideosError ? (
              <ErrorDisplay message={savedVideosError} />
            ) : savedVideos.length === 0 ? (
              <EmptyState message="No videos have been saved yet. Click &quot;Find Videos&quot; to discover rare gems!" />
            ) : (
              <>
                <VideoGrid 
                  videos={savedVideos} 
                  onVideoClick={handleVideoClick}
                  onRemoveVideo={removeVideo}
                  isVideoSaved={() => true}
                  showSaveButtons={true}
                  isSavedVideosView={true}
                />

                {/* Pagination controls */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Showing {savedVideos.length} of {pagination.totalCount} videos
                    </div>
                    <Pagination pagination={pagination} onPageChange={goToPage} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* API Stats Display - only show in search mode */}
        {appMode === 'search' && (apiStats.totalApiCalls > 0 || apiStats.cachedSearches > 0 || apiStats.cachedVideoDetails > 0) && (
          <div className={`mt-8 ${styles.layout.panel}`}>
            <h3 className={`${styles.text.body} font-semibold mb-2 text-gray-700`}>API Statistics</h3>
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