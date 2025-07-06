import React from 'react'
import { render, screen } from '@testing-library/react'
import VideoCall from '../VideoCall'

jest.mock('@/components/theme/ThemeProvider', () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
}))

jest.mock('agora-rtc-sdk-ng', () => ({
  __esModule: true,
  createClient: () => ({ connectionState: 'DISCONNECTED', on: jest.fn(), removeAllListeners: jest.fn(), join: jest.fn(), publish: jest.fn(), leave: jest.fn() }),
  default: { createClient: () => ({ connectionState: 'DISCONNECTED', on: jest.fn(), removeAllListeners: jest.fn(), join: jest.fn(), publish: jest.fn(), leave: jest.fn() }) }
}))

const props = {
  channelName: 'vid',
  userId: 'u1',
  appId: 'bad', // invalid length
  onCallEnd: jest.fn(),
}

describe('VideoCall – invalid App ID branch', () => {
  it('shows validation overlay', async () => {
    render(<VideoCall {...props} />)
    expect(await screen.findByText(/invalid agora app id/i)).toBeInTheDocument()
  })
}) 