import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import IncomingCallNotification from '../IncomingCallNotification'

const defaultProps = {
  callerName: 'Alice',
  callerAvatar: '/avatar.png',
  isVideoCall: true,
  onAccept: jest.fn(),
  onDecline: jest.fn(),
}

describe('IncomingCallNotification', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders caller info and buttons', () => {
    render(<IncomingCallNotification {...defaultProps} />)

    expect(screen.getByText(/alice/i)).toBeInTheDocument()
    expect(screen.getByTitle(/accept call/i)).toBeInTheDocument()
    expect(screen.getByTitle(/decline call/i)).toBeInTheDocument()
  })

  it('calls onAccept when accept clicked', () => {
    render(<IncomingCallNotification {...defaultProps} />)

    fireEvent.click(screen.getByTitle(/accept call/i))
    expect(defaultProps.onAccept).toHaveBeenCalled()
  })

  it('calls onDecline when decline clicked', () => {
    render(<IncomingCallNotification {...defaultProps} />)

    fireEvent.click(screen.getByTitle(/decline call/i))
    expect(defaultProps.onDecline).toHaveBeenCalled()
  })

  it('auto-declines after 30 seconds', () => {
    render(<IncomingCallNotification {...defaultProps} />)

    jest.advanceTimersByTime(30000)
    expect(defaultProps.onDecline).toHaveBeenCalled()
  })
}) 