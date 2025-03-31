import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';
import React from 'react';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
}));

// Suppress React act() warnings in tests
// This makes sense because we're testing async behavior
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Configure a fake timer to control the async behaviors
jest.useFakeTimers();

describe('useAsync Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  
  afterAll(() => {
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn));

    expect(result.current).toMatchObject({
      data: null,
      isLoading: false,
      error: null,
    });
    expect(typeof result.current.execute).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('should set isLoading to true when immediate is true', () => {
    const asyncFn = jest.fn().mockResolvedValue('data');
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: true }));

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle successful async operation', async () => {
    // Create a promise we can control
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>(resolve => {
      resolvePromise = resolve;
    });
    
    const asyncFn = jest.fn().mockReturnValue(promise);
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useAsync(asyncFn, { onSuccess }));
    
    act(() => {
    });

    expect(result.current.isLoading).toBe(false);
    
    // Start execution
    let executePromise;
    act(() => {
      executePromise = result.current.execute();
    });
    
    // Check loading state
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the promise inside act
    await act(async () => {
      resolvePromise('test data');
      jest.runAllTimers();
    });
    
    // Wait for execution to complete
    await executePromise;
    
    // Assertions after async operation completes
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith('test data');
  });

  it('should handle error in async operation', async () => {
    // Create a promise we can control
    let rejectPromise: (reason: Error) => void;
    const promise = new Promise<string>((resolve, reject) => {
      rejectPromise = reject;
    });
    
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockReturnValue(promise);
    const onError = jest.fn();
    
    const { result } = renderHook(() => useAsync(asyncFn, { onError }));
    
    act(() => {
    });
    
    // Start execution
    let executePromise;
    act(() => {
      executePromise = result.current.execute().catch(() => {});
    });
    
    // Check loading state
    expect(result.current.isLoading).toBe(true);
    
    // Reject the promise inside act
    await act(async () => {
      rejectPromise(error);
      jest.runAllTimers();
    });
    
    // Wait for execution to complete
    await executePromise;
    
    // Assertions after error
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Test error');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should reset state correctly', async () => {
    // Create a promise we can control
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>(resolve => {
      resolvePromise = resolve;
    });
    
    const asyncFn = jest.fn().mockReturnValue(promise);
    
    const { result } = renderHook(() => useAsync(asyncFn));
    
    act(() => {
    });
    
    // Start execution
    let executePromise;
    act(() => {
      executePromise = result.current.execute();
    });
    
    // Resolve the promise inside act
    await act(async () => {
      resolvePromise('test data');
      jest.runAllTimers();
    });
    
    // Wait for execution to complete
    await executePromise;
    
    expect(result.current.data).toBe('test data');
    
    // Reset the state
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should execute immediately when immediate option is true', async () => {
    // Create a promise that we control resolution for
    let resolvePromise: (value: string) => void;
    const promise = new Promise<string>(resolve => {
      resolvePromise = resolve;
    });
    
    const asyncFn = jest.fn().mockReturnValue(promise);
    
    // Render with immediate=true inside an act to catch all state updates
    const { result } = renderHook(() => useAsync(asyncFn, { immediate: true }));
    
    act(() => {
    });
    
    // Verify loading state
    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    
    // Resolve the promise inside act to handle the state update properly
    await act(async () => {
      resolvePromise('immediate data');
      // Advance timers to process all async operations
      jest.runAllTimers();
    });
    
    // Verify final state
    expect(result.current.data).toBe('immediate data');
    expect(result.current.isLoading).toBe(false);
  });

  it('should allow manual state setting', () => {
    const asyncFn = jest.fn();
    
    const { result } = renderHook(() => useAsync(asyncFn));
    
    act(() => {
    });
    
    act(() => {
      result.current.setData('manual data');
      result.current.setLoading(true);
      result.current.setError('manual error');
    });
    
    expect(result.current.data).toBe('manual data');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe('manual error');
  });
});