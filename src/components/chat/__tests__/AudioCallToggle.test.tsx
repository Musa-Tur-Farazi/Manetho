import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AudioCall from '../AudioCall'

// ---- Mock external dependencies ----

// Minimal stub of the Agora SDK used by AudioCall
const mockSetEnabled = jest.fn()
const mockAudioTrack = {
  setEnabled: mockSetEnabled,
  close: jest.fn(),
}

const mockClient = {
  connectionState: 'DISCONNECTED',
  on: jest.fn(),
  leave: jest.fn(),
  publish: jest.fn(),
  subscribe: jest.fn(),
  removeAllListeners: jest.fn(),
  join: jest.fn(() => Promise.resolve()),
}

jest.mock('agora-rtc-sdk-ng', () => {
  return {
    __esModule: true,
    default: {
      createClient: () => mockClient,
      createMicrophoneAudioTrack: () => Promise.resolve(mockAudioTrack),
    },
    createClient: () => mockClient,
    createMicrophoneAudioTrack: () => Promise.resolve(mockAudioTrack),
  }
})

// Stub ThemeProvider to avoid context issues
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

// Global fetch mock returning valid token (happy-path)
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: 'tok', uid: '1', expiresAt: Date.now() + 3600 }),
    })
  ) as jest.Mock
})

describe('AudioCall – toggle controls', () => {
  const props = {
    channelName: 'audioTest',
    userId: 'user1',
    onCallEnd: jest.fn(),
    appId: '12345678901234567890123456789012',
  }

  it('toggles mute ↔ unmute when microphone button clicked', async () => {
    render(<AudioCall {...props} />)

    // Wait until the mute button appears (initially titled "Mute")
    const muteBtn = await screen.findByTitle(/mute/i, {}, { timeout: 3000 })
    expect(muteBtn).toBeInTheDocument()

    // Click to mute → title should change to "Unmute"
    fireEvent.click(muteBtn)

    await waitFor(() => {
      expect(muteBtn).toHaveAttribute('title', 'Unmute')
    })

    // Click again → back to "Mute"
    fireEvent.click(muteBtn)
    await waitFor(() => {
      expect(muteBtn).toHaveAttribute('title', 'Mute')
    })
  })

  it('switches speaker mode when speaker button clicked', async () => {
    render(<AudioCall {...props} />)

    const speakerBtn = await screen.findByTitle(/switch to earpiece/i, {}, { timeout: 3000 })
    expect(speakerBtn).toBeInTheDocument()

    fireEvent.click(speakerBtn)

    await waitFor(() => {
      expect(speakerBtn).toHaveAttribute('title', 'Switch to speaker')
    })
  })
}) 