import React from 'react';
import { SavedVideo, PaginationMetadata } from '@/types';
import styles from '@/lib/styles';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import EmptyState from '@/components/ui/EmptyState';
import VideoGrid from '@/components/VideoGrid';
import Pagination from '@/components/ui/Pagination';

interface SavedVideosContentProps {
  savedVideos: SavedVideo[];
  pagination: PaginationMetadata;
  isLoading: boolean;
  error: string | null;
  handleVideoClick: (videoId: string) => void;
  removeVideo: (videoId: string) => Promise<boolean>;
  goToPage: (page: number) => void;
}

/**
 * Component for displaying saved videos content, including video grid, pagination, and loading states
 */
const SavedVideosContent: React.FC<SavedVideosContentProps> = ({
  savedVideos,
  pagination,
  isLoading,
  error,
  handleVideoClick,
  removeVideo,
  goToPage
}) => {
  return (
    <div className="mb-8">
      <h2 className={styles.layout.sectionHeader}>Community Saved Videos</h2>
      
      {isLoading ? (
        <LoadingIndicator message="Loading saved videos..." />
      ) : error ? (
        <ErrorDisplay message={error} />
      ) : savedVideos.length === 0 ? (
        <EmptyState message="No videos have been saved yet. Click &quot;Find Videos&quot; to discover rare gems!" />
      ) : (
        <>
          <VideoGrid 
            videos={savedVideos} 
            onVideoClick={handleVideoClick}
            onRemoveVideo={removeVideo}
            isVideoSaved={() => true}
            showSaveButtons={true}
            isSavedVideosView={true}
          />

          {/* Pagination controls */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {savedVideos.length} of {pagination.totalCount} videos
              </div>
              <Pagination pagination={pagination} onPageChange={goToPage} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SavedVideosContent;