# GrailTube Coding Standards & Commands

## Commands
- **Build**: `npm run build`
- **Dev Server**: `npm run dev`
- **Lint**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`
- **Run Tests**: `npm test`
- **Run Tests with Watch Mode**: `npm run test:watch`
- **Run Tests with Coverage**: `npm run test:coverage`
- **Run Tests in CI Environment**: `npm run test:ci`

## Code Style
- Use TypeScript with strict type checking
- Follow Next.js conventions for routing and component structure
- Use functional components with React hooks
- Import order: React, Next.js, external libraries, internal modules
- Prefer async/await for asynchronous operations
- Use try/catch blocks for error handling with specific error messages
- Naming: PascalCase for components, camelCase for functions/variables
- Document complex logic with concise comments
- Use Tailwind for styling with semantic class names
- Ensure responsive design on all components

## YouTube API Guidelines
- Store API keys in .env.local (never commit)
- Use the modular YouTube service structure (youtubeService, youtubeFilters, youtubeTypes)
- Video details caching only - search results are not cached to ensure unique results
- Track API call statistics for transparency and display timeframe information
- Always handle rate limiting and quota errors gracefully
- Support AbortController signal for cancellable search requests
- Filter videos by view count (less than 10 views)
- Expanded camera filename patterns (IMG_, DSC_, DCIM, MOV_, VID_, MVI_) for better unedited footage detection
- Use a 1-month timeframe for unedited video searches

## API and Data Guidelines
- Use centralized error handling from src/lib/api.ts
- Use shared fetch utilities for consistent API calling patterns
- Use apiClient for standardized API communication
- Follow data transformation patterns in adapters (videoAdapter.ts)
- Prefer model abstractions for database operations
- Handle loading, error, and success states consistently
- Use database connection verification before operations
- Add appropriate logging for API and database operations
- Implement proper error recovery for network and database issues
- Use MySQL for all database operations (MongoDB has been removed)
- Use template literals for MySQL pagination queries to avoid SQL injection issues

## Logging and Debugging
- Use the centralized logger from src/lib/logger.ts
- Include appropriate log levels (debug, info, warn, error)
- Use structured logging with timestamps and context
- Use logger.time() and logger.timeEnd() for performance monitoring
- Log component lifecycle events (mount/unmount) in hooks
- Add detailed error logs with full context information
- Control log verbosity with environment variables
- Avoid excessive logging in production

## Component Guidelines
- Use shared UI components for common patterns (LoadingIndicator, ErrorDisplay, EmptyState)
- Keep components focused on presentation, delegating data fetching to hooks
- Follow consistent prop patterns across similar components
- Use TypeScript interfaces for component props
- Maintain consistent styling with Tailwind classes
- For tab navigation, use the modern border-bottom style for indication
- Maintain consistent spacing and alignment in navigation components

## State Management
- Use React hooks for local component state
- Custom hooks for complex logic (e.g., useYouTubeSearch, useSavedVideos)
- Use useAsync for consistent async operation handling
- Separate UI concerns from data fetching logic
- Apply consistent patterns for state initialization and updates
- Always track component mount state to prevent memory leaks
- Use refs for storing values that shouldn't trigger re-renders
- Reset state appropriately when switching modes/views
- Provide clear status messages during operations

## Project Structure
- **/src/app**: Next.js app router pages and API routes
  - **page.tsx**: Main application with tabbed navigation and video display
- **/src/components**: Reusable UI components
  - **/src/components/ui**: Shared UI primitives and patterns
  - **SearchTypeIndicator.tsx**: Displays the current search type (currently fixed to Unedited)
  - **SearchStatus.tsx**: Shows search status, progress, and timeframe information
  - **VideoCard.tsx**: Card component for displaying video information
  - **VideoGrid.tsx**: Grid layout for multiple video cards
  - **VideoPlayer.tsx**: Video player modal for watching videos
- **/src/hooks**: Custom React hooks for data fetching and state
  - **useYouTubeSearch.ts**: Manages YouTube search for unedited videos
  - **useSavedVideos.ts**: Handles saved video operations
  - **useAsync.ts**: Generic async operation hook
- **/src/lib**: Utilities and services
  - **/src/lib/models**: Database models and data access
  - YouTube service modules:
    - **youtube.ts**: Main facade/entry point
    - **youtubeService.ts**: Core service implementation
    - **youtubeSearch.ts**: Search-specific functionality 
    - **youtubeVideoDetails.ts**: Video details functionality
    - **youtubeFilters.ts**: Filtering logic
    - **youtubeTypes.ts**: Type definitions
- **/src/types**: TypeScript type definitions including SearchType enum (though currently only Unedited is used)
- **/src/__tests__**: Test files organized by domain (components, hooks, lib)

## Testing Guidelines
- Use Jest and React Testing Library for unit tests
- Organize tests to mirror the source directory structure
- Test components, hooks, and utilities independently
- Mock external dependencies (API calls, DB operations)
- Use test utilities from `src/__tests__/utils/test-utils.tsx`
- Write tests for both success and error paths
- Use descriptive test names: `describe('Component', () => { it('should do something', () => {}) })`
- Maintain >70% code coverage (statements, functions, branches) as enforced in config
- Run tests before committing changes
- Make sure to run tests after making any big changes
- Use mock functions for API and database operations
- Create focused tests that verify a single behavior
- Test edge cases and error handling
- Keep tests fast and independent of each other
- Address React act() warnings to ensure proper component lifecycle testing
- Use proper boolean attribute values in component tests