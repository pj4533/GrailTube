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

## API Standards
- Store API keys in .env.local (never commit)
- Centralize API calls in src/lib modules
- Always handle loading, success, and error states