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
    keyword,
    setKeyword,
    startSearch,
    changeSearchType
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
    startSearch(searchType);
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
          <div className="flex flex-col">
            {/* Logo */}
            <div className="flex items-center mb-3">
              <h1 className="text-2xl font-bold">GrailTube</h1>
              <p className="ml-4 text-sm hidden md:block text-gray-300">
                Discover rare YouTube videos with &lt;10 views
              </p>
            </div>
            
            {/* Modern Tab Navigation */}
            <div className="flex items-start">
              <div className="flex border-b border-gray-700">
                <button
                  onClick={handleBackToSaved}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    appMode === 'savedVideos'
                      ? 'text-blue-400 border-blue-400' 
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span>Saved Videos</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setAppMode('search')}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
                    appMode === 'search'
                      ? 'text-blue-400 border-blue-400' 
                      : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Videos</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Search Controls - Only visible when in search mode */}
            {appMode === 'search' && (
              <div className="flex items-center space-x-3 mt-4 ml-1">
                <div className="flex space-x-2">
                  <div className="relative group">
                    <select
                      value={searchType}
                      onChange={(e) => changeSearchType(e.target.value as SearchType)}
                      disabled={isSearchLoading}
                      className="appearance-none bg-gray-800 text-white text-sm rounded-md px-3 py-2 pr-8 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all cursor-pointer hover:bg-gray-700"
                    >
                      <option value={SearchType.RandomTime}>Random Time</option>
                      <option value={SearchType.Unedited}>Unedited</option>
                      <option value={SearchType.Keyword}>Keyword</option>
                    </select>
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Keyword input field - only show when SearchType.Keyword is selected */}
                  {searchType === SearchType.Keyword && (
                    <div className="relative">
                      <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter keywords..."
                        disabled={isSearchLoading}
                        className="bg-gray-800 text-white text-sm rounded-md px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all w-40 md:w-56"
                      />
                      {keyword && (
                        <button 
                          onClick={() => setKeyword('')}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          title="Clear"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleStartSearch}
                  disabled={isSearchLoading || (searchType === SearchType.Keyword && !keyword)}
                  className={`px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-1 text-sm font-medium shadow-sm 
                    bg-blue-600 text-white hover:bg-blue-700
                    ${isSearchLoading || (searchType === SearchType.Keyword && !keyword) ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSearchLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            )}
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
            searchType={searchType}
          />
        )}

        {/* Show search results */}
        {hasFoundVideos && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
              <span>Recently Discovered Videos</span>
              <SearchTypeIndicator searchType={searchType} size="sm" className="ml-3" />
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
              Found {searchResults.length} videos with less than 10 views
            </div>
          </div>
        )}

        {/* Show saved videos */}
        {appMode === 'savedVideos' && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">Community Saved Videos</h2>
            {isSavedVideosLoading ? (
              <LoadingIndicator message="Loading saved videos..." />
            ) : savedVideosError ? (
              <ErrorDisplay message={savedVideosError} />
            ) : savedVideos.length === 0 ? (
              <EmptyState message="No videos have been saved yet. Click &quot;Find Videos&quot; to discover rare gems!" />
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