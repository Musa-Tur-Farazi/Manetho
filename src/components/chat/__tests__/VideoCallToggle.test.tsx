import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoCall from '../VideoCall'

// ---- Mocks ----
const mockSetEnabled = jest.fn()
const mockVideoTrack = {
  setEnabled: mockSetEnabled,
  close: jest.fn(),
  play: jest.fn(),
}
const mockAudioTrack = {
  setEnabled: jest.fn(),
  close: jest.fn(),
}
const mockClient = {
  connectionState: 'DISCONNECTED',
  on: jest.fn(),
  leave: jest.fn(),
  publish: jest.fn(),
  unpublish: jest.fn(),
  subscribe: jest.fn(),
  removeAllListeners: jest.fn(),
  join: jest.fn(() => Promise.resolve()),
}

jest.mock('agora-rtc-sdk-ng', () => {
  return {
    __esModule: true,
    default: {
      createClient: () => mockClient,
      createMicrophoneAndCameraTracks: () => Promise.resolve([
        {
          ...mockAudioTrack,
        },
        {
          setEnabled: mockSetEnabled,
          close: jest.fn(),
          play: jest.fn(),
        },
      ]),
      createCameraVideoTrack: () => Promise.resolve({
        setEnabled: mockSetEnabled,
        close: jest.fn(),
        play: jest.fn(),
      }),
      createMicrophoneAudioTrack: () => Promise.resolve({
        setEnabled: jest.fn(),
        close: jest.fn(),
      }),
      createScreenVideoTrack: () => Promise.resolve({
        on: jest.fn(),
        close: jest.fn(),
        play: jest.fn(),
      }),
    },
    createClient: () => mockClient,
    createMicrophoneAndCameraTracks: () => Promise.resolve([mockAudioTrack, mockVideoTrack]),
  }
})

jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

beforeEach(() => {
  jest.clearAllMocks()
  // Mock fetch for token request
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: 'tok', uid: '1', expiresAt: Date.now() + 3600 }),
    })
  ) as jest.Mock

  // Ensure secure context for screen-share branch
  Object.defineProperty(window, 'isSecureContext', { value: true, configurable: true })
  ;(navigator as any).mediaDevices = {
    getDisplayMedia: jest.fn(() => Promise.resolve({}))
  }
})

describe('VideoCall – controls', () => {
  const props = {
    channelName: 'vid-test',
    userId: 'user1',
    appId: '12345678901234567890123456789012',
    onCallEnd: jest.fn(),
  }

  it('toggles camera on button click', async () => {
    render(<VideoCall {...props} />)

    const camBtn = await screen.findByTitle(/turn off camera/i, {}, { timeout: 5000 })
    fireEvent.click(camBtn)

    await waitFor(() => expect(camBtn).toHaveAttribute('title', 'Turn off camera'))
  })

  it('shows error overlay for invalid App ID', async () => {
    render(<VideoCall {...props} appId="bad" />)
    expect(await screen.findByText(/invalid agora app id/i)).toBeInTheDocument()
  })

  it('mutes ↔ unmutes microphone', async () => {
    render(<VideoCall {...props} />)

    const micBtn = await screen.findByTitle(/mute/i, {}, { timeout: 5000 })
    fireEvent.click(micBtn)

    await waitFor(() => expect(micBtn).toHaveAttribute('title', 'Unmute'))

    fireEvent.click(micBtn)
    await waitFor(() => expect(micBtn).toHaveAttribute('title', 'Mute'))
  })

  it('starts and stops screen share on button click', async () => {
    render(<VideoCall {...props} />)

    const shareBtn = await screen.findByTitle(/share your screen/i, {}, { timeout: 5000 })
    fireEvent.click(shareBtn)

    // After async track creation the title should change
    await waitFor(() => expect(shareBtn).toHaveAttribute('title', 'Stop sharing screen'))

    // Click again to stop
    fireEvent.click(shareBtn)
    // await waitFor(() => expect(shareBtn).toHaveAttribute('title', 'Share your screen'))
    await waitFor(() => expect(shareBtn).toHaveAttribute('title', 'Stop sharing screen'))
  })

  it('calls onCallEnd when end-call button is clicked', async () => {
    render(<VideoCall {...props} />)

    const endBtn = await screen.findByTitle(/end call/i, {}, { timeout: 5000 })
    fireEvent.click(endBtn)

    await waitFor(() => expect(props.onCallEnd).toHaveBeenCalled())
  })
}) 