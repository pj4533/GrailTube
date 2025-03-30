import { Video } from '@/types';
import VideoCard from './VideoCard';

interface VideoGridProps {
  videos: Video[];
  onVideoClick: (videoId: string) => void;
}

export default function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No rare videos found. Try again!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onClick={onVideoClick}
        />
      ))}
    </div>
  );
}