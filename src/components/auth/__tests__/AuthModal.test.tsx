import React from 'react'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthModal from '../AuthModal'

// Mock router push
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('AuthModal', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('returns null when isOpen is false', () => {
    const { container } = render(
      <AuthModal isOpen={false} onClose={jest.fn()} />
    )

    expect(container.firstChild).toBeNull()
  })

  it('renders modal contents when isOpen is true', () => {
    render(<AuthModal isOpen={true} onClose={jest.fn()} />)

    expect(
      screen.getByRole('heading', { name: /sign in required/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('invokes onClose when close icon clicked', () => {
    const handleClose = jest.fn()

    render(<AuthModal isOpen={true} onClose={handleClose} />)

    const closeIconButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeIconButton)

    expect(handleClose).toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('calls router.push and onClose when sign-in button clicked', () => {
    const handleClose = jest.fn()

    render(<AuthModal isOpen={true} onClose={handleClose} />)

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    expect(handleClose).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith(
      '/custom-auth/sign-in?redirect_url=%2Fhome'
    )
  })
}) 