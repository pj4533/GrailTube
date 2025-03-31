import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
  className?: string;
  allowFullScreen?: boolean;
}

/**
 * A reusable YouTube embed component
 */
export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'YouTube video player',
  autoplay = false,
  className = 'w-full aspect-video',
  allowFullScreen = true,
}) => {
  // Construct YouTube URL with options
  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}rel=0`;
  
  return (
    <div className={className}>
      <iframe
        src={youtubeUrl}
        title={title}
        frameBorder={0}
        allow={`accelerometer; ${autoplay ? 'autoplay; ' : ''}clipboard-write; encrypted-media; gyroscope; picture-in-picture`}
        allowFullScreen={allowFullScreen}
        className="w-full h-full"
      />
    </div>
  );
};

export default YouTubeEmbed;