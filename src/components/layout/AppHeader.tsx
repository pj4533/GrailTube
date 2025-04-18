import React from 'react';
import { Icon } from '@/components/ui/Icon';
import styles from '@/lib/styles';

interface AppHeaderProps {
  appMode: 'savedVideos' | 'search';
  handleBackToSaved: () => void;
  handleSwitchToSearch: () => void;
}

/**
 * Header component with logo and tabs for main navigation
 */
const AppHeader: React.FC<AppHeaderProps> = ({
  appMode,
  handleBackToSaved,
  handleSwitchToSearch
}) => {
  return (
    <nav className={styles.nav.container}>
      <div className={styles.nav.innerContainer}>
        <div className="flex flex-col">
          {/* Logo and Tabs in same row */}
          <div className="flex items-center justify-between pb-3">
            {/* Left side: Logo and description */}
            <div className="flex items-center">
              <h1 className={styles.text.title}>GrailTube</h1>
              <div className="ml-4 relative hidden md:block">
                <p className="text-sm text-gray-300">
                  Discover rare YouTube videos with &lt;10 views
                </p>
                <a 
                  href="https://github.com/pj4533/GrailTube"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute text-gray-300 hover:text-white transition-colors"
                  aria-label="GitHub Repository"
                  style={{ top: '-2px', right: '-20px' }}
                >
                  <Icon.GitHub className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            {/* Right side: Tab Navigation */}
            <div className="flex">
              <button
                onClick={handleBackToSaved}
                className={`${styles.nav.tabBase} -mb-[1px] ${
                  appMode === 'savedVideos'
                    ? styles.nav.tabActive
                    : styles.nav.tabInactive
                }`}
                data-testid="saved-videos-tab"
              >
                <div className="flex items-center">
                  <Icon.BookmarkOutline className="h-4 w-4 mr-2" />
                  <span>Saved Videos</span>
                </div>
              </button>
              
              <button
                onClick={handleSwitchToSearch}
                className={`${styles.nav.tabBase} -mb-[1px] ${
                  appMode === 'search'
                    ? styles.nav.tabActive
                    : styles.nav.tabInactive
                }`}
                data-testid="find-videos-tab"
              >
                <div className="flex items-center">
                  <Icon.Search className="h-4 w-4 mr-2" />
                  <span>Find Videos</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;