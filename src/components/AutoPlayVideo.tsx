import { useEffect, useRef } from 'react';
import { Video } from '@/types';
import VideoMetadata from './VideoMetadata';

interface AutoPlayVideoProps {
  video: Video;
  onNextVideo: () => void;
  hasMoreVideos: boolean;
}

export default function AutoPlayVideo({ 
  video, 
  onNextVideo,
  hasMoreVideos
}: AutoPlayVideoProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to player when a new video is selected
  useEffect(() => {
    if (videoContainerRef.current) {
      videoContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [video.id]);

  return (
    <div ref={videoContainerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
      <div className="lg:col-span-2">
        <div className="relative pb-[56.25%] h-0 bg-black rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </div>
      <div className="lg:col-span-1">
        <VideoMetadata 
          video={video} 
          onNextVideo={onNextVideo}
          hasMoreVideos={hasMoreVideos}
        />
      </div>
    </div>
  );
}