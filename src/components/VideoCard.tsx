import Image from 'next/image';
import { Video } from '@/types';
import { formatDate } from '@/lib/utils';

interface VideoCardProps {
  video: Video;
  onClick: (videoId: string) => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  return (
    <div
      className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(video.id)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={video.thumbnailUrl}
          alt={video.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{video.channelTitle}</p>
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{formatDate(video.publishedAt)}</span>
          <span>{video.viewCount} views</span>
        </div>
      </div>
    </div>
  );
}