'use client';

import { useState } from 'react';
import { useYouTubeSearch } from '@/hooks/useYouTubeSearch';
import { Video } from '@/types';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';

export default function Home() {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const { 
    isLoading, 
    videos, 
    currentWindow, 
    statusMessage, 
    error, 
    apiStats,
    startSearch 
  } = useYouTubeSearch();

  const handleVideoClick = (videoId: string) => {
    setPlayingVideoId(videoId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">GrailTube</h1>
        <p className="text-xl text-gray-600 mb-6">
          Discover ultra-rare YouTube videos with less than 5 views
        </p>
        <button
          onClick={startSearch}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find Rare Gems'}
        </button>
      </header>

      <SearchStatus
        isLoading={isLoading}
        videos={videos}
        currentWindow={currentWindow}
        statusMessage={statusMessage}
        error={error}
      />

      {!isLoading && (
        <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
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

      {playingVideoId && (
        <VideoPlayer
          videoId={playingVideoId}
          onClose={() => setPlayingVideoId(null)}
        />
      )}
    </div>
  );
}