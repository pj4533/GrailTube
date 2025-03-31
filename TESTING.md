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

## Next Steps for Testing

1. Fix existing test failures related to hook tests
2. Add tests for core components like VideoCard, VideoGrid
3. Add tests for API routes
4. Improve coverage for YouTube service modules
5. Add integration tests for key user flows

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