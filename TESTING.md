# GrailTube Testing Guide

This document describes the testing setup and approach for the GrailTube project.

## Testing Stack

- **Test Runner**: Jest
- **Component Testing**: React Testing Library
- **Coverage Reports**: Jest's built-in coverage reporter
- **Mocking**: Jest mocks for external dependencies

## Test Directory Structure

```
src/
└── __tests__/
    ├── components/        # Component tests
    ├── hooks/             # Hook tests
    ├── lib/               # Utility and service tests
    │   └── models/        # Model tests
    ├── utils/             # Test utilities
    ├── types/             # Type definitions for tests
    ├── setup.ts           # Global test setup
    └── README.md          # Testing documentation
```

## Test Commands

- **Run all tests**: `npm test`
- **Run tests in watch mode**: `npm run test:watch` 
- **Run tests with coverage**: `npm run test:coverage`
- **Run tests in CI environment**: `npm run test:ci`

## Test Examples

### Component Tests

Component tests verify that UI components render correctly and handle user interactions as expected.

Example: `src/__tests__/components/Button.test.tsx`
- Tests rendering with different variants and sizes
- Tests different states (loading, disabled)
- Tests user interactions (clicks)

### Hook Tests

Hook tests verify the behavior of custom React hooks.

Example: `src/__tests__/hooks/useAsync.test.tsx`
- Tests initialization
- Tests async operation success and failure paths
- Tests state management

### Model Tests

Model tests verify database operations work correctly.

Example: `src/__tests__/lib/models/videoModel.test.tsx`
- Tests database CRUD operations
- Tests input/output formatting
- Tests error handling

## Mocking Approach

1. **External Services**: Mock API calls and database operations
2. **Environment Variables**: Set up in `setup.ts`
3. **Browser APIs**: Mock Window methods and DOM APIs not available in Jest

## Coverage Goals

The project aims for minimum 70% coverage across:
- Statements
- Branches
- Functions
- Lines

These thresholds are configured in `jest.config.js`.

## Current Test Coverage

The project has successfully implemented comprehensive test coverage:

- All components have tests, including VideoCard, VideoGrid, and UI primitives
- Custom hooks have tests for success and error paths
- YouTube service modules are fully tested
- API client and utility functions have thorough test coverage
- Code coverage thresholds (>70%) are met and enforced with current metrics:
  - Statements: 77.46%
  - Branches: 78.53%
  - Functions: 78.48%
  - Lines: 78.68%

**Note:** The test suite has been updated to reflect the current state of the codebase, including:

1. The fixed 1-month timeframe for unedited video searches
2. Expanded camera filename patterns (IMG_, DSC_, DCIM, MOV_, VID_, MVI_)
3. No search results caching (only video details are cached)
4. AbortController signal support for cancellable search requests
5. MySQL queries using template literals for pagination to avoid SQL injection issues
6. Simplified filtering logic that only filters videos with fewer than 10 views

## Test Utilities

The `src/__tests__/utils/test-utils.tsx` file provides:
- Helper functions for rendering components
- Mock responses for hooks
- Test data fixtures

## Best Practices

1. Test both success and error paths
2. Keep tests independent of each other
3. Mock external dependencies
4. Use descriptive test names
5. Focus on testing behavior, not implementation details
6. Run tests before committing changes