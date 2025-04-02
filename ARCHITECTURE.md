# GrailTube Architecture

This document provides an overview of the GrailTube application architecture, design patterns, and code organization.

## Architectural Overview

GrailTube follows a layered architecture with clear separation of concerns:

```
╭───────────────────────────╮
│       UI Components       │
│    (React + Tailwind)     │
╰────────────┬──────────────╯
             │
╭────────────▼──────────────╮
│      Data Access Layer    │
│      (Custom Hooks)       │
╰────────────┬──────────────╯
             │
╭────────────▼──────────────╮
│    Services & Adapters    │ 
│    (YouTube / Database)   │
╰────────────┬──────────────╯
             │
╭────────────▼──────────────╮
│    Backend API Routes     │
│    (Next.js API Routes)   │
╰────────────┬──────────────╯
             │
╭────────────▼──────────────╮
│      Database Layer       │
│   (Models + MySQL)        │
╰───────────────────────────╯
```

## Key Design Patterns

### 1. Custom Hooks for Data Fetching and State Management

Custom hooks like `useYouTubeSearch`, `useSavedVideos`, and `useAsync` abstract away the data-fetching logic and state management from the UI components, providing:

- Clean separation between UI and data logic
- Consistent state management (loading, error, data states)
- Reusable data operations
- Component lifecycle management with mount/unmount tracking
- Prevention of memory leaks and React state update errors

### 2. Adapter Pattern

The `videoAdapter` module provides transformation functions between different data formats, ensuring:

- Type safety when converting between `Video` and `SavedVideo` types
- Centralized formatting of data for different contexts
- Consistent data shapes throughout the application

### 3. Repository Pattern

The `VideoModel` implements a repository pattern for database operations:

- Abstracts database queries away from business logic
- Provides a clean, domain-focused API for data access
- Centralizes data access logic in one place

### 4. UI Component Composition

Reusable UI components are composed to build more complex interfaces:

- Small, focused components with single responsibilities
- Shared UI primitives for common patterns (loading, error states)
- Consistent props interfaces across components

## Code Organization

### UI Layer (`/src/components`)

- **Video Components**: `VideoCard`, `VideoGrid`, `VideoPlayer`, `VideoMetadata`, `YouTubeEmbed`
- **Navigation Component**: Modern tabbed interface in the main layout
- **Search Components**: `SearchStatus`, `SearchTypeIndicator`, `ApiStatsDisplay`
- **UI Primitives**: `LoadingIndicator`, `ErrorDisplay`, `EmptyState`, `Button`, `Icon`

### Data Access Layer (`/src/hooks`)

- **Search Hooks**:
  - `useYouTubeSearch` - manages YouTube search state for unedited videos
  - `useYouTubeSearchState` - manages core state for search operations
  - `useYouTubeSearchHelpers` - implements helper functions for search logic
- **Saved Videos Hook**: `useSavedVideos` - manages database interaction for saved videos
- **Async Hook**: `useAsync` - general-purpose hook for async operations with lifecycle management
- **Mount Hook**: `useMounted` - prevents memory leaks by tracking component mount state

### Services Layer (`/src/lib`)

- **YouTube Service**: Modular service for YouTube API interactions
  - `youtube.ts`: Main facade/entry point
  - `youtubeService.ts`: Core service implementation with AbortController signal support
  - `youtubeSearch.ts`: Search-specific functionality with expanded camera filename patterns (IMG_, DSC_, DCIM, MOV_, VID_, MVI_)
  - `youtubeVideoDetails.ts`: Video detail retrieval with caching
  - `youtubeFilters.ts`: Filter for videos with fewer than 10 views
  - `youtubeTypes.ts`: Types and interfaces
- **API Utilities**: 
  - `api.ts` - Shared HTTP client and error handling
  - `apiClient.ts` - Standardized client for API communication
- **Adapters**: `videoAdapter.ts` - Data transformation utilities
- **Database**: `db.ts` - Database connection and query utilities
- **Logging**: `logger.ts` - Centralized logging system with timing functions

### Models Layer (`/src/lib/models`)

- **Video Model**: `videoModel.ts` - Database operations for videos

### API Routes (`/src/app/api`)

- `/saved-videos`: CRUD operations for saved videos
- `/saved-videos/[id]`: Operations on specific videos

### Types (`/src/types`)

- Core type definitions shared across the application
- `SearchType` enum with just one mode:
  - `Unedited`: Finds raw, unedited footage using camera filename patterns
- Previously had other search types that were removed from the codebase

## Data Flow

1. **User Interaction**: User triggers action in UI component
2. **Hook Invocation**: Custom hook handles state updates and API calls
3. **Service Call**: Hook uses service layer for external operations
4. **Data Transformation**: Adapter functions convert data between formats
5. **State Update**: Hook updates local state with results
6. **UI Rendering**: Components re-render with updated data

## Error Handling and Logging

The application uses a centralized error handling and logging approach:

1. **API Errors**: Captured and standardized in the `api.ts` and `apiClient.ts` utilities
2. **UI Feedback**: Error states are passed up to components for display
3. **Error Components**: `ErrorDisplay` component shows user-friendly messages
4. **Database Error Recovery**: Automatic reconnection and connection verification
5. **Component Lifecycle Management**: Prevents React state updates on unmounted components
6. **Logger System**: Structured logging with timestamps, levels, and performance timing
7. **Debugging**: Rich logging throughout the application that can be enabled in development

## YouTube Search Algorithm

This section provides a detailed breakdown of the YouTube search algorithm used in GrailTube. As the search logic evolves, this section will be maintained to reflect the current implementation.

### Search Process Overview

1. **Initialize Search**
   - User clicks "Search" button in the UI
   - The application resets all search state
   - A random past date is generated using `getRandomPastDate()`
   - An initial 30-day time window is created around this random date

2. **Time Window Selection**
   - Every search uses a fixed 1-month (30-day) timeframe
   - The start date is randomly selected from YouTube's history (after 2005)
   - The end date is calculated as start date + 30 days

3. **YouTube API Search Query**
   - Sends request to YouTube Data API v3 `/search` endpoint
   - Uses combined camera filename patterns (IMG_|DSC_|DCIM|MOV_|VID_|MVI_)
   - Sets `maxResults` parameter (typically 50 videos per query)
   - Uses `publishedAfter` and `publishedBefore` parameters with the selected time window
   - Sets `type=video` to exclude playlists and channels

4. **Video Details Retrieval**
   - For each video ID returned by the search query, retrieves detailed information
   - Uses YouTube Data API v3 `/videos` endpoint with `part=snippet,statistics,contentDetails`
   - Batches requests in groups of up to 50 videos to minimize API calls
   - Caches video details to reduce API usage in future searches

5. **Filtering Process**
   - Filters videos based on view count (<10 views)
   - Calculates view statistics (0 views, <10 views, <100 views, <1000 views)
   - Sorts results by view count (lowest first)

6. **Handling No Results**
   - If no videos are found or none have <10 views, automatically "rerolls" to a new time period
   - Attempts up to 7 rerolls before giving up
   - Shows status messages to inform the user about the search progress

7. **AbortController Integration**
   - All API requests use an AbortController signal to allow cancellation
   - If a user cancels the search, all in-progress API calls are immediately terminated
   - The search process can be safely restarted with new parameters

### Implementation Details

- Camera patterns are combined with OR operator: `IMG_|DSC_|DCIM|MOV_|VID_|MVI_`
- All time windows are exactly 30 days (defined in `constants.ts` as `UNEDITED_WINDOW_DAYS`)
- View count filtering uses a strict "less than 10" comparison
- API call statistics are tracked and displayed to users for transparency
- Search operations are cancellable at any point without leaving API requests pending

### Error Handling

- Automatically handles YouTube API quota limits and rate limiting
- Provides user-friendly error messages for network issues
- Detects and logs API errors with appropriate context information
- Implements graceful degradation when the API is unavailable

## Future Considerations

1. **State Management**: Consider more sophisticated state management for growth
2. **Performance Optimization**: Further enhance caching strategies for frequent queries
3. **Internationalization**: Prepare for multi-language support
4. **Accessibility**: Enhance accessibility features for broader user support