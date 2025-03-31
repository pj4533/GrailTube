import logger from '@/lib/logger';

describe('Logger', () => {
  // Save original console methods
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  beforeEach(() => {
    // Mock console methods
    console.debug = jest.fn();
    console.info = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    
    // Mock performance.now
    global.performance.now = jest.fn()
      .mockReturnValueOnce(1000) // First call for timer start
      .mockReturnValueOnce(1500); // Second call for timer end (500ms elapsed)
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
  });

  it('logs debug messages when debug is enabled', () => {
    // Set NODE_ENV to development to enable debug
    const originalNodeEnv = process.env.NODE_ENV;
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = 'development';
    
    const message = 'Debug message';
    const data = { key: 'value' };
    
    logger.debug(message, data);
    
    expect(console.debug).toHaveBeenCalled();
    const loggedMessage = (console.debug as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain('[DEBUG]');
    expect(loggedMessage).toContain(message);
    expect(loggedMessage).toContain(JSON.stringify(data));
    
    // Restore NODE_ENV
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('logs info messages', () => {
    const message = 'Info message';
    const data = { key: 'value' };
    
    logger.info(message, data);
    
    expect(console.info).toHaveBeenCalled();
    const loggedMessage = (console.info as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain('[INFO]');
    expect(loggedMessage).toContain(message);
    expect(loggedMessage).toContain(JSON.stringify(data));
  });

  it('logs warning messages', () => {
    const message = 'Warning message';
    const data = { key: 'value' };
    
    logger.warn(message, data);
    
    expect(console.warn).toHaveBeenCalled();
    const loggedMessage = (console.warn as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain('[WARN]');
    expect(loggedMessage).toContain(message);
    expect(loggedMessage).toContain(JSON.stringify(data));
  });

  it('logs error messages', () => {
    const message = 'Error message';
    const error = new Error('Test error');
    
    logger.error(message, error);
    
    expect(console.error).toHaveBeenCalledTimes(2); // Once for the message, once for the stack
    const loggedMessage = (console.error as jest.Mock).mock.calls[0][0];
    expect(loggedMessage).toContain('[ERROR]');
    expect(loggedMessage).toContain(message);
    
    // Should log the stack trace separately
    expect(console.error).toHaveBeenCalledWith(error.stack);
  });

  it('tracks time with time() and timeEnd()', () => {
    // Set NODE_ENV to development to enable debug
    const originalNodeEnv = process.env.NODE_ENV;
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = 'development';
    
    const label = 'operation';
    
    logger.time(label);
    logger.timeEnd(label);
    
    expect(console.debug).toHaveBeenCalledTimes(2);
    expect((console.debug as jest.Mock).mock.calls[0][0]).toContain('Timer started: operation');
    expect((console.debug as jest.Mock).mock.calls[1][0]).toContain('Timer \'operation\' completed in 500.00ms');
    
    // Restore NODE_ENV
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('warns when timeEnd() is called without a corresponding time()', () => {
    const label = 'nonexistent';
    
    logger.timeEnd(label);
    
    expect(console.warn).toHaveBeenCalled();
    expect((console.warn as jest.Mock).mock.calls[0][0]).toContain(`Timer '${label}' does not exist`);
  });

  it('enables debug in development mode', () => {
    // Save the original value
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDebugFlag = process.env.NEXT_PUBLIC_DEBUG;
    
    // Ensure we're in development mode
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = 'development';
    delete process.env.NEXT_PUBLIC_DEBUG;
    
    // Clear any previous calls
    (console.debug as jest.Mock).mockClear();
    
    // This should log in development mode
    logger.debug('Should log in development');
    
    expect(console.debug).toHaveBeenCalledTimes(1);
    
    // Restore the original values
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_DEBUG = originalDebugFlag;
  });
  
  it('enables debug with NEXT_PUBLIC_DEBUG flag', () => {
    // Save the original value
    const originalNodeEnv = process.env.NODE_ENV;
    const originalDebugFlag = process.env.NEXT_PUBLIC_DEBUG;
    
    // Set production mode but enable debug with flag
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_DEBUG = 'true';
    
    // Clear any previous calls
    (console.debug as jest.Mock).mockClear();
    
    // This should log because of the flag
    logger.debug('Should log with flag');
    
    expect(console.debug).toHaveBeenCalledTimes(1);
    
    // Restore the original values
    // @ts-ignore - we need to modify the readonly property for testing
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NEXT_PUBLIC_DEBUG = originalDebugFlag;
  });
});