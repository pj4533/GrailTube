'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { Video } from '@/types';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
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

  const handleVideoClick = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleClosePlayer = () => {
    setSelectedVideoId(null);
  };

  const hasFoundVideos = !isLoading && videos.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GrailTube</h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover rare YouTube videos with less than 10 views
        </p>
        <button
          onClick={() => {
            setSelectedVideoId(null);
            startSearch();
          }}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find Rare Videos'}
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

      {/* Show video grid when videos are found */}
      {hasFoundVideos && !isLoading && (
        <div className="my-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">Videos with less than 10 views</h2>
          <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
        </div>
      )}

      {/* Video player modal */}
      {selectedVideoId && (
        <VideoPlayer videoId={selectedVideoId} onClose={handleClosePlayer} />
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

      {/* Show result count */}
      {hasFoundVideos && !isLoading && (
        <div className="text-center mt-6 text-gray-600">
          <p>Found {videos.length} videos with less than 10 views</p>
        </div>
      )}
    </div>
  );
}