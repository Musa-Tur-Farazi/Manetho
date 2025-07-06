import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VideoCall from '../VideoCall'

// stub theme provider
jest.mock('@/components/theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

// minimal Agora mock (not used in this branch)
jest.mock('agora-rtc-sdk-ng', () => ({
  __esModule: true,
  default: { createClient: () => ({ on: jest.fn(), removeAllListeners: jest.fn(), join: jest.fn(), publish: jest.fn(), leave: jest.fn(), connectionState: 'DISCONNECTED' }) },
  createClient: () => ({ on: jest.fn(), removeAllListeners: jest.fn(), join: jest.fn(), publish: jest.fn(), leave: jest.fn(), connectionState: 'DISCONNECTED' }),
}))

const props = {
  channelName: 'testChan',
  userId: 'u1',
  appId: '12345678901234567890123456789012',
  onCallEnd: jest.fn(),
}

beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ token: 'tok', uid: '1', expiresAt: Date.now() + 3600 }) })) as jest.Mock
  // make screen-share unsupported
  // @ts-ignore
  delete navigator.mediaDevices?.getDisplayMedia
  Object.defineProperty(window, 'isSecureContext', { value: true })
  window.alert = jest.fn()
})

describe('VideoCall – unsupported screen share branch', () => {
  it('alerts when screen sharing not supported', async () => {
    render(<VideoCall {...props} />)

    const shareBtn = await screen.findByTitle(/share your screen/i, {}, { timeout: 5000 })
    fireEvent.click(shareBtn)

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled()
    })
  })
}) 