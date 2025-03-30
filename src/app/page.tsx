'use client';

import { useState } from 'react';
import { addMinutes, subMinutes } from 'date-fns';
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
  // No more MAX_EXPANSIONS limit - we'll keep going until we find results

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);
    setVideos([]);
    setExpansionCount(0);
    
    try {
      // Get a random date and create initial 60-minute window
      const randomDate = getRandomPastDate();
      const initialWindow = createInitialTimeWindow(randomDate);
      setCurrentWindow(initialWindow);
      
      // Start the search process with step 1
      await searchWithExpansion(initialWindow, 1);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const searchWithExpansion = async (timeWindow: TimeWindow, currentStep: number = 1) => {
    setStatusMessage(`Step ${currentStep}: Scanning for videos uploaded between ${formatTimeWindow(timeWindow)}`);
    
    // Search for videos in the current window
    const videoIds = await searchVideosInTimeWindow(timeWindow);
    
    if (videoIds.length === 0) {
      // No videos found, keep expanding the time window with no max limit
      const nextStep = currentStep + 1;
      setExpansionCount(nextStep - 1);
      
      // Calculate next window size for status message
      const newWindow = expandTimeWindow(timeWindow);
      const expansionFactor = Math.round(newWindow.durationMinutes / timeWindow.durationMinutes);
      
      setStatusMessage(`No videos found. Expanding search range ${expansionFactor}x to ${newWindow.durationMinutes} minutes...`);
      
      // Small delay to show the expansion message
      await new Promise(resolve => setTimeout(resolve, 1200));
      setCurrentWindow(newWindow);
      await searchWithExpansion(newWindow, nextStep);
    } else {
      // Videos found, get their details
      setStatusMessage(`Found ${videoIds.length} videos! Analyzing view counts to find hidden gems...`);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Filter for videos with less than 5 views
      const rareVideos = filterRareVideos(videoDetails);
      
      if (rareVideos.length === 0) {
        // Adaptive behavior: If we found too many videos, use a smaller expansion factor
        let nextExpansionStep;
        
        // Adaptive window sizing based on video volume
        if (videoIds.length > 200) {
          // Very busy time period - use smaller expansion or even contract
          setStatusMessage(`Found ${videoDetails.length} videos in a busy period. Refining search...`);
          // Contract the window slightly but not below 30 min
          const newDuration = Math.max(timeWindow.durationMinutes * 0.8, 30);
          const centerTime = new Date((timeWindow.startDate.getTime() + timeWindow.endDate.getTime()) / 2);
          const halfDuration = newDuration / 2;
          
          nextExpansionStep = {
            startDate: subMinutes(centerTime, halfDuration),
            endDate: addMinutes(centerTime, halfDuration),
            durationMinutes: newDuration
          };
        } else if (videoIds.length > 50) {
          // Moderately busy - expand slower
          setStatusMessage(`Found ${videoDetails.length} videos, but none are rare treasures yet. Expanding search moderately...`);
          const newDuration = timeWindow.durationMinutes * 1.5; // Slower expansion
          const centerTime = new Date((timeWindow.startDate.getTime() + timeWindow.endDate.getTime()) / 2);
          const halfDuration = newDuration / 2;
          
          nextExpansionStep = {
            startDate: subMinutes(centerTime, halfDuration),
            endDate: addMinutes(centerTime, halfDuration),
            durationMinutes: newDuration
          };
        } else {
          // Not many videos - expand more aggressively
          setStatusMessage(`Found ${videoDetails.length} videos, but none are rare treasures yet. Expanding search aggressively...`);
          // Use the normal 3x expansion
          nextExpansionStep = expandTimeWindow(timeWindow);
        }
        
        const nextStep = currentStep + 1;
        setExpansionCount(nextStep - 1);
        
        // Small delay to show the expansion message
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCurrentWindow(nextExpansionStep);
        await searchWithExpansion(nextExpansionStep, nextStep);
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

      {currentWindow && (
        <div className="text-center mb-8">
          {!isLoading && videos.length > 0 ? (
            <p className="text-gray-600">
              Found {videos.length} rare videos uploaded between{' '}
              <span className="font-semibold">
                {formatTimeWindow(currentWindow)}
              </span>
            </p>
          ) : (
            <p className="text-gray-600">
              Searching time period: <span className="font-semibold">{formatTimeWindow(currentWindow)}</span>
            </p>
          )}
        </div>
      )}

      {statusMessage && isLoading && (
        <div className="text-center mb-4">
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