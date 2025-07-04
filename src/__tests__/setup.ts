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

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      imageUrl: 'https://example.com/avatar.jpg',
    },
  }),
  useAuth: () => ({
    isSignedIn: true,
    userId: 'test-user-id',
    getToken: jest.fn(() => Promise.resolve('test-token')),
  }),
  SignInButton: ({ children }: any) => children,
  SignUpButton: ({ children }: any) => children,
  UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }, 'User'),
  ClerkProvider: ({ children }: any) => children,
  auth: () => ({
    userId: 'test-user-id',
    user: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
    },
  }),
}))

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
     args[0].includes('inside a test was not wrapped in act'))
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

// Setup fetch mock
require('jest-fetch-mock').enableMocks() 