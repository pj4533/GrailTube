import { Video } from '@/types';
import apiClient from '@/lib/apiClient';

// Mock fetch
global.fetch = jest.fn();

// Mock logger to prevent test output pollution
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn()
}));

describe('API Client', () => {
  const mockSuccessResponse = {
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({ id: 'test-id', name: 'test' })
  };

  const mockErrorResponse = {
    ok: false,
    status: 404,
    statusText: 'Not Found',
    json: jest.fn().mockResolvedValue({ error: 'Not found' })
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetch', () => {
    it('should make a request with correct parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      await apiClient.fetch('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    it('should handle query parameters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      await apiClient.fetch('/test', {
        params: {
          page: 1,
          limit: 10,
          search: 'test'
        }
      });
      
      const url = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('search=test');
    });

    it('should parse JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);

      const response = await apiClient.fetch('/test');
      
      expect(mockSuccessResponse.json).toHaveBeenCalled();
      expect(response.data).toEqual({ id: 'test-id', name: 'test' });
      expect(response.error).toBeNull();
    });

    it('should handle error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockErrorResponse);

      const response = await apiClient.fetch('/test');
      
      expect(response.data).toBeNull();
      expect(response.error).toBe('Not found');
      expect(response.statusCode).toBe(404);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const response = await apiClient.fetch('/test');
      
      expect(response.data).toBeNull();
      expect(response.error).toBe('Network error');
      expect(response.statusCode).toBe(0);
    });
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      await apiClient.get('/test');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET'
        })
      );
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      const data = { name: 'test' };
      await apiClient.post('/test', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('put', () => {
    it('should make a PUT request with body', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      const data = { id: 1, name: 'updated' };
      await apiClient.put('/test/1', data);
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(mockSuccessResponse);
      
      await apiClient.delete('/test/1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });
  });
});