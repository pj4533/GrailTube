import { Icon } from './ui/Icon';
import YouTubeEmbed from './YouTubeEmbed';

interface VideoPlayerProps {
  videoId: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoId, onClose }: VideoPlayerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
        <div className="flex justify-end p-2 bg-gray-900">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none p-1"
            aria-label="Close video player"
          >
            <Icon.Close className="h-6 w-6" />
          </button>
        </div>
        <div className="relative pb-[56.25%] h-0">
          <YouTubeEmbed 
            videoId={videoId} 
            autoplay={true}
            className="absolute top-0 left-0 w-full h-full" 
          />
        </div>
      </div>
    </div>
  );
}