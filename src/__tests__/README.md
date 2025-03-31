# Testing Strategy for GrailTube

This directory contains tests for the GrailTube application. The tests are organized by domain (components, hooks, lib) to mirror the source code structure.

## Test Structure

- `components/`: Tests for React components
- `hooks/`: Tests for custom React hooks
- `lib/`: Tests for utilities, services, and models
- `utils/`: Test utilities and helpers
- `setup.ts`: Global test setup and mocks

## Technologies

- Jest: Test runner and assertion library
- React Testing Library: For testing React components
- Jest mocks: For isolating dependencies

## Current Status

Initial test setup with some example tests for:
- Components: Button component
- Hooks: useAsync and useYouTubeSearch
- Models: VideoModel

Code coverage is currently at a basic level and should be improved incrementally.

## Next Steps

1. Fix current test failures
   - Update useYouTubeSearch test to use modern React Testing Library patterns
   - Fix act() warnings in hook tests

2. Add more component tests
   - Test key UI components like VideoCard, VideoGrid, SearchStatus
   - Test UI primitive components in ui/ directory

3. Add more service tests
   - Test YouTube service modules
   - Test API client functionality

4. Add more hook tests
   - Complete testing for useSavedVideos
   - Add tests for any missing hook functionality

5. Add integration tests
   - Test integration between components and hooks
   - Test API routes

6. Improve coverage
   - Aim for 70%+ coverage on critical paths
   - Focus on error handling and edge cases

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (good for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Coverage Thresholds

Current target coverage thresholds (configured in jest.config.js):
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## Best Practices

1. Tests should be independent of each other
2. Use mocks for external dependencies 
3. Test both success and failure cases
4. Keep tests focused on a single behavior
5. Use descriptive test names
6. Run tests before committing changes