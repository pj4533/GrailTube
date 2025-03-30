'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { Video } from '@/types';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';
import AutoPlayVideo from '@/components/AutoPlayVideo';

export default function Home() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const { 
    isLoading, 
    videos, 
    currentWindow, 
    statusMessage, 
    error,
    viewStats,
    apiStats,
    startSearch 
  } = useYouTubeSearch();

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const hasFoundVideos = !isLoading && videos.length > 0;
  const currentVideo = hasFoundVideos ? videos[currentVideoIndex] : null;
  const hasMoreVideos = hasFoundVideos && currentVideoIndex < videos.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GrailTube</h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover untouched YouTube videos with zero views
        </p>
        <button
          onClick={() => {
            setCurrentVideoIndex(0);
            startSearch();
          }}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find Untouched Videos'}
        </button>
      </header>

      {/* Show search status during loading */}
      {(!hasFoundVideos || isLoading) && (
        <SearchStatus
          isLoading={isLoading}
          videos={videos}
          currentWindow={currentWindow}
          statusMessage={statusMessage}
          error={error}
          viewStats={viewStats}
        />
      )}

      {/* Automatically show the first video when found */}
      {currentVideo && (
        <AutoPlayVideo 
          video={currentVideo}
          onNextVideo={handleNextVideo}
          hasMoreVideos={hasMoreVideos}
        />
      )}

      {/* API Stats Display */}
      {(apiStats.totalApiCalls > 0 || apiStats.cachedSearches > 0 || apiStats.cachedVideoDetails > 0) && (
        <ApiStatsDisplay 
          searchApiCalls={apiStats.searchApiCalls}
          videoDetailApiCalls={apiStats.videoDetailApiCalls}
          totalApiCalls={apiStats.totalApiCalls}
          cachedSearches={apiStats.cachedSearches}
          cachedVideoDetails={apiStats.cachedVideoDetails}
        />
      )}

      {/* Show result count if multiple videos are found */}
      {hasFoundVideos && videos.length > 1 && (
        <div className="text-center mt-6 text-gray-600">
          <p>Video {currentVideoIndex + 1} of {videos.length} untouched videos</p>
        </div>
      )}
    </div>
  );
}