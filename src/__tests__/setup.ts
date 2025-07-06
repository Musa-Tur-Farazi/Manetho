import '@testing-library/jest-dom'
import 'jest-fetch-mock'
import { TextEncoder, TextDecoder } from 'util'
import React from 'react'

// Mock global objects
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder as any

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock MediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    })),
    getDisplayMedia: jest.fn(() => Promise.resolve({
      getTracks: () => [],
      getVideoTracks: () => [],
    })),
  },
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock document.createRange
global.Range = function Range() {} as any

const createContextualFragment = (html: string) => {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

Range.prototype.createContextualFragment = createContextualFragment
Range.prototype.selectNodeContents = () => {}
Range.prototype.getBoundingClientRect = () => ({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0,
  x: 0,
  y: 0,
  toJSON: () => {},
})

// Mock KaTeX for math rendering
jest.mock('katex', () => ({
  render: jest.fn(),
  renderToString: jest.fn(() => '<span>math</span>'),
}))

// Mock Agora RTC SDK
jest.mock('agora-rtc-sdk-ng', () => ({
  createClient: jest.fn(() => ({
    join: jest.fn(() => Promise.resolve()),
    leave: jest.fn(() => Promise.resolve()),
    publish: jest.fn(() => Promise.resolve()),
    unpublish: jest.fn(() => Promise.resolve()),
    subscribe: jest.fn(() => Promise.resolve()),
    unsubscribe: jest.fn(() => Promise.resolve()),
    on: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    connectionState: 'DISCONNECTED',
    remoteUsers: [],
  })),
  createCameraVideoTrack: jest.fn(() => Promise.resolve({ play: jest.fn(), stop: jest.fn(), setEnabled: jest.fn(), close: jest.fn() })),
  createMicrophoneAndCameraTracks: jest.fn(() => Promise.resolve([
    { play: jest.fn(), stop: jest.fn(), setEnabled: jest.fn(), close: jest.fn() },
    { play: jest.fn(), stop: jest.fn(), setEnabled: jest.fn(), close: jest.fn() },
  ])),
  createScreenVideoTrack: jest.fn(() => Promise.resolve({
    close: jest.fn(),
  })),
  createMicrophoneAudioTrack: jest.fn(() => Promise.resolve({
    close: jest.fn(),
  })),
}))

// Mock crypto for Clerk
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32))),
    },
    getRandomValues: (arr: any) => {
      return arr.map(() => Math.floor(Math.random() * 256));
    }
  }
});

// A more robust and comprehensive mock for Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => ({
    userId: 'clerk_user_123',
    getToken: jest.fn().mockResolvedValue('mock_token'),
  })),
  clerkClient: {
    users: {
      getUser: jest.fn((userId) =>
        Promise.resolve({
          id: userId,
          firstName: 'Mocked',
          lastName: 'User',
          emailAddresses: [{ emailAddress: 'mock@example.com' }],
          imageUrl: 'https://example.com/avatar.jpg',
          publicMetadata: {},
        })
      ),
    },
  },
  currentUser: jest.fn().mockResolvedValue({
    id: 'clerk_user_123',
    firstName: 'Mocked',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'mock@example.com' }],
    imageUrl: 'https://example.com/avatar.jpg',
  }),
}));

// Mock Clerk for API tests
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({
    userId: 'clerk_user_123',
    user: {
      id: 'clerk_user_123',
      fullName: 'John Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg'
    }
  })),
  currentUser: jest.fn(() => Promise.resolve({
    id: 'clerk_user_123',
    fullName: 'John Doe',
    emailAddresses: [{ emailAddress: 'john@example.com' }],
    imageUrl: 'https://example.com/avatar.jpg'
  })),
  clerkClient: {
    users: {
      getUser: jest.fn((userId) => Promise.resolve({
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg'
      }))
    }
  },
  useUser: jest.fn(() => ({
    isSignedIn: true,
    isLoaded: true,
    user: {
      id: 'clerk_user_123',
      fullName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg'
    }
  })),
  useAuth: jest.fn(() => ({
    isSignedIn: true,
    isLoaded: true,
    userId: 'clerk_user_123',
    getToken: jest.fn().mockResolvedValue('mock_token'),
  })),
  SignIn: function MockSignIn(props) {
    return React.createElement('div', { 'data-testid': 'sign-in-mock' }, props.children);
  },
  SignUp: function MockSignUp(props) {
    return React.createElement('div', { 'data-testid': 'sign-up-mock' }, props.children);
  },
  SignedIn: function MockSignedIn(props) {
    return React.createElement('div', { 'data-testid': 'signed-in-mock' }, props.children);
  },
  SignedOut: function MockSignedOut(props) {
    return React.createElement('div', { 'data-testid': 'signed-out-mock' }, props.children);
  },
  UserButton: function MockUserButton(props) {
    return React.createElement('div', { 'data-testid': 'user-button-mock' }, 'UserButton');
  },
  ClerkLoaded: function MockClerkLoaded(props) {
    return React.createElement('div', {}, props.children);
  },
  ClerkLoading: function MockClerkLoading(props) {
    return React.createElement('div', {}, props.children);
  },
  ClerkProvider: function MockClerkProvider({ children }) {
    return React.createElement('div', {}, children);
  },
}));


// Mock Clerk backend
jest.mock('@clerk/backend', () => ({
  Clerk: jest.fn(() => ({
    users: {
      getUser: jest.fn(() => Promise.resolve({
        id: 'clerk_user_123',
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg'
      }))
    }
  })),
  clerkClient: {
    users: {
      getUser: jest.fn(() => Promise.resolve({
        id: 'clerk_user_123',
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg'
      }))
    }
  },
  webhooks: {
    constructEvent: jest.fn(() => ({
      type: 'user.created',
      data: {
        id: 'clerk_user_123',
        firstName: 'John',
        lastName: 'Doe',
        emailAddresses: [{ emailAddress: 'john@example.com' }],
        imageUrl: 'https://example.com/avatar.jpg'
      }
    }))
  },
  // Add ESM exports mock
  __esModule: true,
  webcrypto: {
    subtle: {
      digest: jest.fn(() => Promise.resolve(new ArrayBuffer(32)))
    }
  }
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('div', props, children),
    span: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('span', props, children),
    button: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('button', props, children),
    section: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('section', props, children),
    a: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('a', props, children),
    p: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('p', props, children),
    h1: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('h1', props, children),
    h2: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('h2', props, children),
    h3: ({ children, whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('h3', props, children),
    img: ({ whileHover, whileTap, animate, initial, exit, ...props }: any) => 
      React.createElement('img', props),
  },
  AnimatePresence: ({ children }: any) => children,
  useScroll: () => ({ scrollY: { current: 0 } }),
  useTransform: () => 0,
  useMotionValue: () => ({ set: jest.fn(), get: () => 0 }),
}))

// Suppress specific console warnings in tests
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: An invalid form control') ||
     args[0].includes('React does not recognize the `whileHover` prop') ||
     args[0].includes('React does not recognize the `whileTap` prop') ||
     args[0].includes('React does not recognize the `animate` prop') ||
     args[0].includes('React does not recognize the `initial` prop') ||
     args[0].includes('React does not recognize the `exit` prop') ||
     args[0].includes('inside a test was not wrapped in act') ||
     // Expected error logs from unit tests simulating failure scenarios
     args[0].includes('Download failed') ||
     args[0].includes('Upload error') ||
     args[0].includes('Delete error') ||
     args[0].includes('Drizzle API Error') ||
     args[0].includes('Drizzle Create Thread Error') ||
     args[0].includes('User sync attempt') ||
     args[0].includes('Error checking if user exists') ||
     args[0].includes('Not implemented: window.open') ||
     args[0].includes('Error fetching') ||
     args[0].includes('AI request failed') ||
     args[0].includes('React does not recognize the `whileInView` prop'))
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

// Suppress specific console warnings in tests (e.g., expected network/download fallbacks)
const originalConsoleWarn = console.warn
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Download failed for') ||
     args[0].includes('Could not revoke object URL'))
  ) {
    return
  }
  originalConsoleWarn.call(console, ...args)
}

// Setup fetch mock
require('jest-fetch-mock').enableMocks() 

// Polyfill missing browser APIs for JSDOM environment used by Jest
if (typeof window !== 'undefined') {
  // Stub window.open to prevent JSDOM not-implemented errors (jsdom provides but throws)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.open = jest.fn();

  // Ensure URL API functions exist
  if (!('createObjectURL' in window.URL)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock');
  }
  if (!('revokeObjectURL' in window.URL)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.URL.revokeObjectURL = jest.fn();
  }
} 