'use client';

import { useState } from 'react';
import { 
  getRandomPastDate, 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos 
} from '@/lib/youtube';
import { Video } from '@/types';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [searchDate, setSearchDate] = useState<Date | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setVideos([]);
    
    try {
      // Get a random date
      const randomDate = getRandomPastDate();
      setSearchDate(randomDate);
      
      // Search for videos in a 10-minute window
      const videoIds = await searchVideosInTimeWindow(randomDate);
      
      if (videoIds.length === 0) {
        setError('No videos found in the selected time window. Try again!');
        setIsLoading(false);
        return;
      }
      
      // Get video details
      const videoDetails = await getVideoDetails(videoIds);
      
      // Filter for videos with less than 5 views
      const rareVideos = filterRareVideos(videoDetails);
      
      setVideos(rareVideos);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

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
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Searching...' : 'Find Rare Gems'}
        </button>
      </header>

      {searchDate && !isLoading && videos.length > 0 && (
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Found {videos.length} rare videos uploaded around{' '}
            <span className="font-semibold">
              {searchDate.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </p>
        </div>
      )}

      {error && (
        <div className="text-center mb-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center my-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
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