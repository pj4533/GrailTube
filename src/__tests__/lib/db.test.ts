import { 
  initializeDb, 
  closeDb, 
  isDbConnected, 
  getVideoCollection, 
  handleDbError 
} from '@/lib/db';
import { Collection, Db, MongoClient } from 'mongodb';
import { Video } from '@/types';

// Mock MongoDB modules
jest.mock('mongodb');

// Mock logger to prevent test output pollution
jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  time: jest.fn(),
  timeEnd: jest.fn()
}));

// Skip these tests due to TextEncoder issues in the MongoDB package during testing
describe.skip('Database Module', () => {
  let mockClient: jest.Mocked<MongoClient>;
  let mockDb: jest.Mocked<Db>;
  let mockCollection: jest.Mocked<Collection<Video>>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up mock implementations
    mockCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn()
    } as unknown as jest.Mocked<Collection<Video>>;
    
    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection)
    } as unknown as jest.Mocked<Db>;
    
    mockClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue(mockDb),
      close: jest.fn().mockResolvedValue(undefined),
      isConnected: jest.fn()
    } as unknown as jest.Mocked<MongoClient>;
    
    (MongoClient as unknown as jest.Mock).mockReturnValue(mockClient);
  });

  describe('initializeDb', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
      process.env.MONGODB_URI = 'mongodb://localhost:27017';
      process.env.MONGODB_DB = 'test_db';
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should connect to MongoDB with correct URI', async () => {
      await initializeDb();
      
      expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017', expect.any(Object));
      expect(mockClient.connect).toHaveBeenCalled();
      expect(mockClient.db).toHaveBeenCalledWith('test_db');
    });

    it('should not reconnect if already connected', async () => {
      // First connection
      await initializeDb();
      
      // Mock isConnected to return true
      mockClient.isConnected.mockReturnValue(true);
      
      // Second connection attempt
      await initializeDb();
      
      // connect should only be called once
      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });

    it('should throw error if MongoDB URI is not configured', async () => {
      delete process.env.MONGODB_URI;
      
      await expect(initializeDb()).rejects.toThrow('MongoDB connection string not found');
    });

    it('should throw error if MongoDB database name is not configured', async () => {
      delete process.env.MONGODB_DB;
      
      await expect(initializeDb()).rejects.toThrow('MongoDB database name not found');
    });

    it('should handle connection errors', async () => {
      mockClient.connect.mockRejectedValue(new Error('Connection error'));
      
      await expect(initializeDb()).rejects.toThrow('Failed to connect to MongoDB: Connection error');
    });
  });

  describe('closeDb', () => {
    it('should close the MongoDB connection', async () => {
      // Set up a connected client
      await initializeDb();
      mockClient.isConnected.mockReturnValue(true);
      
      await closeDb();
      
      expect(mockClient.close).toHaveBeenCalled();
    });

    it('should do nothing if no connection exists', async () => {
      await closeDb();
      
      expect(mockClient.close).not.toHaveBeenCalled();
    });

    it('should handle close errors', async () => {
      // Set up a connected client
      await initializeDb();
      mockClient.isConnected.mockReturnValue(true);
      mockClient.close.mockRejectedValue(new Error('Close error'));
      
      await expect(closeDb()).rejects.toThrow('Failed to close MongoDB connection: Close error');
    });
  });

  describe('isDbConnected', () => {
    it('should return true for connected client', () => {
      mockClient.isConnected.mockReturnValue(true);
      
      expect(isDbConnected()).toBe(true);
    });

    it('should return false for disconnected client', () => {
      mockClient.isConnected.mockReturnValue(false);
      
      expect(isDbConnected()).toBe(false);
    });

    it('should return false if client does not exist', () => {
      // Reset the client to simulate uninitialized state
      (MongoClient as unknown as jest.Mock).mockReturnValue(null);
      
      expect(isDbConnected()).toBe(false);
    });
  });

  describe('getVideoCollection', () => {
    it('should return the video collection', async () => {
      // Initialize DB first
      await initializeDb();
      mockClient.isConnected.mockReturnValue(true);
      
      const collection = getVideoCollection();
      
      expect(mockDb.collection).toHaveBeenCalledWith('videos');
      expect(collection).toBe(mockCollection);
    });

    it('should throw error if database is not connected', () => {
      mockClient.isConnected.mockReturnValue(false);
      
      expect(() => getVideoCollection()).toThrow('Database is not connected');
    });
  });

  describe('handleDbError', () => {
    it('should wrap MongoDB errors with context', () => {
      const error = new Error('MongoDB error');
      
      expect(() => handleDbError(error, 'test operation')).toThrow('Database error during test operation: MongoDB error');
    });

    it('should handle non-Error objects', () => {
      expect(() => handleDbError('string error', 'test')).toThrow('Database error during test: string error');
    });
  });
});