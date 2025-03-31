# GrailTube Coding Standards & Commands

## Commands
- **Build**: `npm run build`
- **Dev Server**: `npm run dev`
- **Lint**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`

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
- Use caching mechanisms to reduce API quota usage
- Track API call statistics for transparency
- Always handle rate limiting and quota errors gracefully
- Filter out commercial content, live streams, and misleading content 

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
- **/src/components**: Reusable UI components
  - **/src/components/ui**: Shared UI primitives and patterns
- **/src/hooks**: Custom React hooks for data fetching and state
- **/src/lib**: Utilities and services
  - **/src/lib/models**: Database models and data access
  - YouTube service modules:
    - **youtube.ts**: Main facade/entry point
    - **youtubeService.ts**: Core service implementation
    - **youtubeSearch.ts**: Search-specific functionality 
    - **youtubeVideoDetails.ts**: Video details functionality
    - **youtubeError.ts**: Error handling
    - **youtubeFilters.ts**: Filtering logic
    - **youtubeTypes.ts**: Type definitions
- **/src/types**: TypeScript type definitions including SearchType enum