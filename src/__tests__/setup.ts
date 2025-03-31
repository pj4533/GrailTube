// Mock process.env variables for tests
process.env = {
  ...process.env,
  NODE_ENV: 'test',
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
  MYSQL_HOST: 'localhost',
  MYSQL_USER: 'test_user',
  MYSQL_PASSWORD: 'test_password',
  MYSQL_DATABASE: 'grailtube_test',
  YOUTUBE_API_KEY: 'test_youtube_api_key',
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the ResizeObserver
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

global.ResizeObserver = ResizeObserverMock as any;

// Mock for IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
} as any;

// Add a simple test to avoid "no test" warning
describe('Test Environment', () => {
  it('has process.env set up', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined();
  });
});