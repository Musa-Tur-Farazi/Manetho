import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AudioCall from '../AudioCall'

// Mock ThemeProvider to avoid dependency
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

// Mock fetch used inside AudioCall to obtain Agora token
beforeEach(() => {
  jest.clearAllMocks()
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ token: 'token123', uid: '1', expiresAt: Date.now() + 3600 })
    })
  ) as jest.Mock
})

describe('AudioCall component', () => {
  const validAppId = '12345678901234567890123456789012'
  const defaultProps = {
    channelName: 'audioTest',
    userId: 'caller123',
    onCallEnd: jest.fn(),
    appId: validAppId,
  }

  it('renders and allows ending the call', async () => {
    render(<AudioCall {...defaultProps} />)

    const endBtn = await screen.findByTitle(/end call/i, {}, { timeout: 3000 })
    expect(endBtn).toBeInTheDocument()

    fireEvent.click(endBtn)
    await waitFor(() => expect(defaultProps.onCallEnd).toHaveBeenCalled())
  })

  it('shows validation error for invalid App ID', async () => {
    const badId = 'short-id'
    render(<AudioCall {...defaultProps} appId={badId} />)

    const errText = await screen.findByText(/Invalid Agora App ID format/i, {}, { timeout: 2000 })
    expect(errText).toBeInTheDocument()
  })
}) 