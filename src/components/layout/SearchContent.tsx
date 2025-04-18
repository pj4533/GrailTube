import React from 'react';
import { TimeWindow, Video, ViewStats } from '@/types';
import styles from '@/lib/styles';
import { formatTimeWindow } from '@/lib/utils';
import SearchStatus from '@/components/SearchStatus';
import ApiStatsDisplay from '@/components/ApiStatsDisplay';
import VideoGrid from '@/components/VideoGrid';
import { Icon } from '@/components/ui/Icon';

interface SearchContentProps {
  isSearchLoading: boolean;
  searchResults: Video[];
  currentWindow: TimeWindow | null;
  statusMessage: string | null;
  searchError: string | null;
  viewStats: ViewStats | null;
  apiStats: {
    searchApiCalls: number;
    videoDetailApiCalls: number;
    totalApiCalls: number;
  };
  hasFoundVideos: boolean;
  isSearchModeNoResults: boolean;
  handleVideoClick: (videoId: string) => void;
  saveVideo: (video: Video) => Promise<boolean>;
  isVideoSaved: (videoId: string) => boolean;
  cancelSearch: () => void;
  performReroll: () => void;
}

/**
 * Component for displaying search content, including status, results, and reroll button
 */
const SearchContent: React.FC<SearchContentProps> = ({
  isSearchLoading,
  searchResults,
  currentWindow,
  statusMessage,
  searchError,
  viewStats,
  apiStats,
  hasFoundVideos,
  isSearchModeNoResults,
  handleVideoClick,
  saveVideo,
  isVideoSaved,
  cancelSearch,
  performReroll
}) => {
  return (
    <>
      {/* Show search status during loading or reroll */}
      {(isSearchModeNoResults || isSearchLoading) && (
        <SearchStatus
          isLoading={isSearchLoading}
          videos={searchResults}
          currentWindow={currentWindow}
          statusMessage={statusMessage}
          error={searchError}
          viewStats={viewStats}
          onCancelSearch={cancelSearch}
        />
      )}

      {/* Show search results */}
      {hasFoundVideos && (
        <div className="mb-8">
          <h2 className={`${styles.layout.sectionHeader} flex items-center justify-between`}>
            <span>Results for {currentWindow && formatTimeWindow(currentWindow)}</span>
            <RerollButton 
              isLoading={isSearchLoading}
              onClick={performReroll}
            />
          </h2>
          <VideoGrid 
            videos={searchResults} 
            onVideoClick={handleVideoClick} 
            onSaveVideo={saveVideo}
            isVideoSaved={isVideoSaved}
            showSaveButtons={true}
          />
          
          {/* Search results count */}
          <div className="mt-4 text-sm text-gray-500">
            Found {searchResults.length} unedited videos sorted by view count
          </div>
        </div>
      )}

      {/* API Stats Display - only show if there are API calls */}
      {apiStats.totalApiCalls > 0 && (
        <div className={`mt-8 ${styles.layout.panel}`}>
          <h3 className={`${styles.text.body} font-semibold mb-2 text-gray-700`}>API Statistics</h3>
          <ApiStatsDisplay 
            searchApiCalls={apiStats.searchApiCalls}
            videoDetailApiCalls={apiStats.videoDetailApiCalls}
            totalApiCalls={apiStats.totalApiCalls}
          />
        </div>
      )}
    </>
  );
};

/**
 * Button component for rerolling search results
 */
interface RerollButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

const RerollButton: React.FC<RerollButtonProps> = ({ isLoading, onClick }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`rounded-full px-3 py-1.5 transition-colors flex items-center ${isLoading ? 'bg-gray-200 text-gray-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
      title="Find different videos"
      data-testid="reroll-button"
    >
      {isLoading ? (
        <>
          <Icon.Spinner className="h-5 w-5 mr-2" />
          <span className="font-semibold">Finding...</span>
        </>
      ) : (
        <>
          <Icon.RerollDice className="h-5 w-5 mr-2" />
          <span className="font-semibold">Find more...</span>
        </>
      )}
    </button>
  );
};

export default SearchContent;