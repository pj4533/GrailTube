import { renderHook, act } from '@testing-library/react';
import { useYouTubeApiKey } from '@/hooks/useYouTubeApiKey';
import { YOUTUBE_API_KEY_STORAGE } from '@/lib/constants';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};

// Save the original localStorage before tests
const originalLocalStorage = global.localStorage;

describe('useYouTubeApiKey hook', () => {
  beforeAll(() => {
    // Replace localStorage with our mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
  });

  afterAll(() => {
    // Restore the original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with null apiKey and set isLoaded to true', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useYouTubeApiKey());
    
    expect(result.current.apiKey).toBeNull();
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.hasCustomKey).toBe(false);
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith(YOUTUBE_API_KEY_STORAGE);
  });

  it('should initialize with stored apiKey and set hasCustomKey to true', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('test-api-key');
    
    const { result } = renderHook(() => useYouTubeApiKey());
    
    expect(result.current.apiKey).toBe('test-api-key');
    expect(result.current.isLoaded).toBe(true);
    expect(result.current.hasCustomKey).toBe(true);
  });

  it('should set apiKey and update localStorage when setApiKey is called with a value', () => {
    mockLocalStorage.getItem.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useYouTubeApiKey());
    
    act(() => {
      result.current.setApiKey('new-api-key');
    });
    
    expect(result.current.apiKey).toBe('new-api-key');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(YOUTUBE_API_KEY_STORAGE, 'new-api-key');
  });

  it('should set apiKey to null and remove from localStorage when setApiKey is called with null', () => {
    mockLocalStorage.getItem.mockReturnValueOnce('existing-key');
    
    const { result } = renderHook(() => useYouTubeApiKey());
    
    act(() => {
      result.current.setApiKey(null);
    });
    
    expect(result.current.apiKey).toBeNull();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(YOUTUBE_API_KEY_STORAGE);
  });

  it('should handle localStorage errors properly', () => {
    // Simulate an error in localStorage.getItem
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage access denied');
    });
    
    const { result } = renderHook(() => useYouTubeApiKey());
    
    expect(result.current.apiKey).toBeNull();
    expect(result.current.isLoaded).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});