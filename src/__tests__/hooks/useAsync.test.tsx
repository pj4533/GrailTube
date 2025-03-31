import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '@/hooks/useAsync';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn(),
}));

describe('useAsync Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    const asyncFn = jest.fn().mockResolvedValue('test data');
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => 
      useAsync(asyncFn, { onSuccess })
    );

    expect(result.current.isLoading).toBe(false);
    
    // Execute the async function and wrap in act
    await act(async () => {
      await result.current.execute();
    });
    
    // Assertions after async operation completes
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith('test data');
  });

  it('should handle error in async operation', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();
    
    const { result } = renderHook(() => 
      useAsync(asyncFn, { onError })
    );
    
    // Execute and wait for rejection
    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected rejection
      }
    });
    
    // Assertions after error
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Test error');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should reset state correctly', async () => {
    const asyncFn = jest.fn().mockResolvedValue('test data');
    
    const { result } = renderHook(() => useAsync(asyncFn));
    
    // Execute the async function
    await act(async () => {
      await result.current.execute();
    });
    
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
    const asyncFn = jest.fn().mockResolvedValue('immediate data');
    
    renderHook(() => 
      useAsync(asyncFn, { immediate: true })
    );
    
    expect(asyncFn).toHaveBeenCalledTimes(1);
    
    // Wait for all effects to complete
    await waitFor(() => {
      expect(asyncFn).toHaveBeenCalled();
    });
  });

  it('should allow manual state setting', () => {
    const asyncFn = jest.fn();
    
    const { result } = renderHook(() => useAsync(asyncFn));
    
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