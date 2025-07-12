import React from 'react'
import { render } from '@testing-library/react'
import VideoCall from '../VideoCall'

// Mock ThemeProvider
jest.mock('@/components/theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

// Prepare placeholders to capture callbacks
let eventHandlers: Record<string, Function> = {}

const mockClient = {
  connectionState: 'DISCONNECTED',
  on: jest.fn((evt: string, cb: Function) => {
    eventHandlers[evt] = cb
  }),
  removeAllListeners: jest.fn(),
  join: jest.fn(() => Promise.resolve()),
  publish: jest.fn(() => Promise.resolve()),
  subscribe: jest.fn(() => Promise.resolve()),
  leave: jest.fn(() => Promise.resolve()),
}

const mockTrack = {
  play: jest.fn(),
  stop: jest.fn(),
  close: jest.fn(),
  setEnabled: jest.fn(),
}

// Agora factory mocks
jest.mock('agora-rtc-sdk-ng', () => ({
  __esModule: true,
  default: { createClient: () => mockClient },
  createClient: () => mockClient,
  createMicrophoneAndCameraTracks: () => Promise.resolve([mockTrack, mockTrack]),
  createCameraVideoTrack: () => Promise.resolve(mockTrack),
  createMicrophoneAudioTrack: () => Promise.resolve(mockTrack),
  createScreenVideoTrack: () => Promise.resolve({ ...mockTrack }),
}))

beforeEach(() => {
  eventHandlers = {}
  jest.clearAllMocks()
  // Mock token fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'tok', uid: '1', expiresAt: Date.now() + 3600 }) })
  ) as jest.Mock
})

describe('VideoCall – remote user track branch', () => {
  it('handles user-published event', async () => {
    render(<VideoCall channelName="branch" userId="1" appId="12345678901234567890123456789012" onCallEnd={jest.fn()} />)

    // simulate remote user published after component setup
    const remoteUser = { uid: 'remote', videoTrack: mockTrack, audioTrack: mockTrack }
    // wait tiny tick to ensure handler registered
    await Promise.resolve()
    eventHandlers['user-published']?.(remoteUser, 'video')

    await import('@testing-library/react').then(({ waitFor }) => waitFor(() => {
      expect(mockClient.subscribe).toHaveBeenCalled()
    }))
  })
}) 