import { renderHook, act } from '@testing-library/react';
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
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsync(asyncFn, { onSuccess })
    );

    expect(result.current.isLoading).toBe(false);
    
    act(() => {
      result.current.execute();
    });
    
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe('test data');
    expect(result.current.error).toBe(null);
    expect(onSuccess).toHaveBeenCalledWith('test data');
  });

  it('should handle error in async operation', async () => {
    const error = new Error('Test error');
    const asyncFn = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsync(asyncFn, { onError })
    );
    
    act(() => {
      result.current.execute();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Test error');
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should reset state correctly', async () => {
    const asyncFn = jest.fn().mockResolvedValue('test data');
    
    const { result, waitForNextUpdate } = renderHook(() => useAsync(asyncFn));
    
    act(() => {
      result.current.execute();
    });
    
    await waitForNextUpdate();
    
    expect(result.current.data).toBe('test data');
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.data).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should execute immediately when immediate option is true', async () => {
    const asyncFn = jest.fn().mockResolvedValue('immediate data');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useAsync(asyncFn, { immediate: true })
    );
    
    expect(result.current.isLoading).toBe(true);
    expect(asyncFn).toHaveBeenCalledTimes(1);
    
    await waitForNextUpdate();
    
    expect(result.current.data).toBe('immediate data');
    expect(result.current.isLoading).toBe(false);
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