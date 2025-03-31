/**
 * Simple logging utility that can be controlled via environment variables
 */

// Enable different log levels based on environment
const isDebugEnabled = 
  process.env.NODE_ENV !== 'production' || 
  process.env.NEXT_PUBLIC_DEBUG === 'true';

// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Keep track of performance measurements
const timeMarkers: Record<string, number> = {};

/**
 * Format the log message with timestamp and level
 */
const formatLog = (level: LogLevel, message: string, data?: any): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`;
};

/**
 * Logger utility with various methods
 */
export const logger = {
  debug: (message: string, data?: any) => {
    if (isDebugEnabled) {
      console.debug(formatLog('debug', message, data));
    }
  },

  info: (message: string, data?: any) => {
    console.info(formatLog('info', message, data));
  },

  warn: (message: string, data?: any) => {
    console.warn(formatLog('warn', message, data));
  },

  error: (message: string, error?: any) => {
    console.error(formatLog('error', message, error));
    if (error instanceof Error) {
      console.error(error.stack);
    }
  },

  // Performance timing utilities
  time: (label: string) => {
    timeMarkers[label] = performance.now();
    if (isDebugEnabled) {
      console.debug(formatLog('debug', `Timer started: ${label}`));
    }
  },

  timeEnd: (label: string) => {
    if (!timeMarkers[label]) {
      logger.warn(`Timer '${label}' does not exist`);
      return;
    }

    const duration = performance.now() - timeMarkers[label];
    if (isDebugEnabled) {
      console.debug(formatLog('debug', `Timer '${label}' completed in ${duration.toFixed(2)}ms`));
    }
    delete timeMarkers[label];
    return duration;
  }
};

export default logger;