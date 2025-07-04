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

// Dummy appId (32 chars) & token
const dummyAppId = '12345678901234567890123456789012'
const dummyToken = 'dummy_token'

const defaultProps = {
  channelName: 'testChannel',
  userId: 'user1',
  onCallEnd: jest.fn(),
  appId: dummyAppId,
  token: dummyToken,
  recipientName: 'Tester',
}

describe('AudioCall component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders connecting UI initially', () => {
    render(<AudioCall {...defaultProps} />)

    expect(screen.getByText(/calling tester/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('fires onCallEnd when cancel clicked during connecting', () => {
    render(<AudioCall {...defaultProps} />)

    const cancelBtn = screen.getByRole('button', { name: /cancel/i })
    fireEvent.click(cancelBtn)

    expect(defaultProps.onCallEnd).toHaveBeenCalled()
  })
}) 