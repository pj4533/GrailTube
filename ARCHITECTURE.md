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

### 1. Custom Hooks for Data Fetching

Custom hooks like `useYouTubeSearch` and `useSavedVideos` abstract away the data-fetching logic from the UI components, providing:

- Clean separation between UI and data logic
- Consistent state management (loading, error, data states)
- Reusable data operations

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

- **Video Components**: `VideoCard`, `VideoGrid`, `VideoPlayer`
- **Status Components**: `SearchStatus`, `ApiStatsDisplay`
- **UI Primitives**: `LoadingIndicator`, `ErrorDisplay`, `EmptyState`

### Data Access Layer (`/src/hooks`)

- **Search Hook**: `useYouTubeSearch` - manages YouTube search state
- **Saved Videos Hook**: `useSavedVideos` - manages database interaction

### Services Layer (`/src/lib`)

- **YouTube Service**: Modular service for YouTube API interactions
  - `youtubeService.ts`: Core service implementation
  - `youtubeFilters.ts`: Filtering logic for videos
  - `youtubeTypes.ts`: Types and interfaces
- **API Utilities**: `api.ts` - Shared HTTP client and error handling
- **Adapters**: `videoAdapter.ts` - Data transformation utilities
- **Database**: `db.ts` - Database connection and query utilities

### Models Layer (`/src/lib/models`)

- **Video Model**: `videoModel.ts` - Database operations for videos

### API Routes (`/src/app/api`)

- `/saved-videos`: CRUD operations for saved videos
- `/saved-videos/[id]`: Operations on specific videos

### Types (`/src/types`)

- Core type definitions shared across the application

## Data Flow

1. **User Interaction**: User triggers action in UI component
2. **Hook Invocation**: Custom hook handles state updates and API calls
3. **Service Call**: Hook uses service layer for external operations
4. **Data Transformation**: Adapter functions convert data between formats
5. **State Update**: Hook updates local state with results
6. **UI Rendering**: Components re-render with updated data

## Error Handling

The application uses a centralized error handling approach:

1. **API Errors**: Captured and standardized in the `api.ts` utility
2. **UI Feedback**: Error states are passed up to components for display
3. **Error Components**: `ErrorDisplay` component shows user-friendly messages

## Future Considerations

1. **Testing**: Add comprehensive test coverage, especially for service and hook layers
2. **State Management**: Consider more sophisticated state management for growth
3. **Performance Optimization**: Add caching strategies for frequent queries
4. **Internationalization**: Prepare for multi-language support