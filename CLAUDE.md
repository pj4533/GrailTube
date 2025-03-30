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
- Centralize API calls in src/lib/youtube.ts
- Use caching mechanisms to reduce API quota usage
- Track API call statistics for transparency
- Always handle rate limiting and quota errors gracefully
- Filter out live streams and misleading content when searching for rare videos

## State Management
- Use React hooks for local component state
- Custom hooks for complex logic (e.g., useYouTubeSearch)
- Separate UI concerns from data fetching logic
- Handle loading, error, and success states consistently
- Provide clear status messages during search operations

## Project Structure
- **/src/components**: Reusable UI components
- **/src/hooks**: Custom React hooks 
- **/src/lib**: Utility functions and API services
- **/src/types**: TypeScript type definitions
- **/src/app**: Next.js app router pages and layouts