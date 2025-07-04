import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import VideoCall from '../VideoCall'

// Stub ThemeProvider
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

const dummyAppId = '12345678901234567890123456789012'

const defaultProps = {
  channelName: 'videoTest',
  userId: 'user1',
  onCallEnd: jest.fn(),
  appId: dummyAppId,
}

describe('VideoCall component', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock fetch for token request
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'token123', uid: '1', expiresAt: Date.now() + 3600 }),
      })
    ) as jest.Mock
  })

  it('renders UI and shows end call button', async () => {
    render(<VideoCall {...defaultProps} />)

    const endBtn = await screen.findByTitle(/end call/i, {}, { timeout: 2000 })
    expect(endBtn).toBeInTheDocument()
  })

  it('calls onCallEnd when end call clicked', async () => {
    render(<VideoCall {...defaultProps} />)

    const endBtn = await screen.findByTitle(/end call/i, {}, { timeout: 3000 })
    fireEvent.click(endBtn)

    await waitFor(() => {
      expect(defaultProps.onCallEnd).toHaveBeenCalled()
    })
  })
}) 