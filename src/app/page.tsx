'use client';

import { useState } from 'react';
import { 
  getRandomPastDate,
  createInitialTimeWindow, 
  searchVideosInTimeWindow, 
  getVideoDetails, 
  filterRareVideos,
  expandTimeWindow,
  formatTimeWindow,
  TimeWindow 
} from '@/lib/youtube';
import { Video } from '@/types';
import VideoGrid from '@/components/VideoGrid';
import VideoPlayer from '@/components/VideoPlayer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentWindow, setCurrentWindow] = useState<TimeWindow | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expansionCount, setExpansionCount] = useState<number>(0);
  const MAX_EXPANSIONS = 5; // Limit the number of time window expansions

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setExpansionCount(0);
    
    try {
      // Get a random date and create initial 10-minute window
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate);
      setCurrentWindow(initialWindow);
      
      // Start the search process
      await searchWithExpansion(initialWindow);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const searchWithExpansion = async (timeWindow: TimeWindow) => {
    setStatusMessage(`Searching for videos from ${formatTimeWindow(timeWindow)}`);
    
    // Search for videos in the current window
    const videoIds = await searchVideosInTimeWindow(timeWindow);
    
    if (videoIds.length === 0) {
      // No videos found, try expanding the time window
      if (expansionCount >= MAX_EXPANSIONS) {
        setError('No rare videos found after several attempts. Try again!');
        setIsLoading(false);
        return;
      }
      
      setStatusMessage(`No videos found. Expanding time window...`);
      setExpansionCount(prev => prev + 1);
      
      // Expand the time window and try again
      const newWindow = expandTimeWindow(timeWindow);
      setCurrentWindow(newWindow);
      
      // Small delay to show the expansion message
      await new Promise(resolve => setTimeout(resolve, 1000));
      await searchWithExpansion(newWindow);
    } else {
      // Videos found, get their details
      setStatusMessage(`Found ${videoIds.length} videos. Checking view counts...`);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Filter for videos with less than 5 views
      const rareVideos = filterRareVideos(videoDetails);
      
      if (rareVideos.length === 0) {
        // No rare videos found, try expanding the time window
        if (expansionCount >= MAX_EXPANSIONS) {
          setError('Found videos, but none with less than 5 views. Try again!');
          setIsLoading(false);
          return;
        }
        
        setStatusMessage(`Found ${videoDetails.length} videos, but none with less than 5 views. Expanding time window...`);
        setExpansionCount(prev => prev + 1);
        
        // Expand the time window and try again
        const newWindow = expandTimeWindow(timeWindow);
        setCurrentWindow(newWindow);
        
        // Small delay to show the expansion message
        await new Promise(resolve => setTimeout(resolve, 1000));
        await searchWithExpansion(newWindow);
      } else {
        // Success! We found rare videos
        setVideos(rareVideos);
        setStatusMessage(null);
        setIsLoading(false);
      }
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

      {currentWindow && !isLoading && videos.length > 0 && (
        <div className="text-center mb-8">
          <p className="text-gray-600">
            Found {videos.length} rare videos uploaded between{' '}
            <span className="font-semibold">
              {formatTimeWindow(currentWindow)}
            </span>
          </p>
        </div>
      )}

      {statusMessage && isLoading && (
        <div className="text-center mb-8">
          <p className="text-blue-600">{statusMessage}</p>
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