import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'test-key',
  NEXT_PUBLIC_APPWRITE_ENDPOINT: 'https://test.appwrite.io/v1',
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: 'test-project-id',
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: 'test-bucket-id',
  NEXT_PUBLIC_AGORA_APP_ID: 'test-agora-app-id',
};
