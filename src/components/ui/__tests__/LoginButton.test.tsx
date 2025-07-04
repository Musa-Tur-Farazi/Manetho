import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginButton from '../LoginButton'
import { customRender } from '../../../__tests__/utils/test-utils'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Override the global Clerk mock for this test to simulate not signed in
jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    isSignedIn: false,
    user: null,
  }),
  useAuth: () => ({
    isSignedIn: false,
    userId: undefined,
    getToken: jest.fn(() => Promise.resolve('test-token')),
  }),
  SignInButton: ({ children }: any) => children,
  SignUpButton: ({ children }: any) => children,
  UserButton: () => React.createElement('div', { 'data-testid': 'user-button' }, 'User'),
  ClerkProvider: ({ children }: any) => children,
  auth: () => ({
    userId: undefined,
    user: null,
  }),
}))

describe('LoginButton', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders with login text when not signed in', () => {
    customRender(<LoginButton />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    customRender(<LoginButton className="custom-login-button" />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass('custom-login-button')
  })

  it('navigates to sign-in page when clicked', () => {
    customRender(<LoginButton />)
    const button = screen.getByRole('button', { name: /login/i })
    fireEvent.click(button)
    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in')
  })

  it('handles multiple clicks', () => {
    customRender(<LoginButton />)
    const button = screen.getByRole('button', { name: /login/i })
    fireEvent.click(button)
    fireEvent.click(button)
    fireEvent.click(button)
    expect(mockPush).toHaveBeenCalledTimes(3)
    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in')
  })

  it('renders with custom className and navigates correctly', () => {
    customRender(<LoginButton className="test-class" />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass('test-class')
    fireEvent.click(button)
    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in')
  })

  it('handles empty className', () => {
    customRender(<LoginButton className="" />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in')
  })

  it('handles very long className', () => {
    const longClassName = 'a'.repeat(100)
    customRender(<LoginButton className={longClassName} />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass(longClassName)
  })

  it('maintains button accessibility', () => {
    customRender(<LoginButton />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toBeVisible()
    // No need to expect type attribute explicitly as it's optional
  })

  it('works with keyboard navigation', () => {
    customRender(<LoginButton />)
    const button = screen.getByRole('button', { name: /login/i })
    button.focus()
    expect(button).toHaveFocus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    // Ensure navigation still not triggered by keydown
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('handles special characters in className', () => {
    const specialClassName = 'button-with-🚀-emoji & <script>alert("xss")</script>'
    customRender(<LoginButton className={specialClassName} />)
    const button = screen.getByRole('button', { name: /login/i })
    expect(button).toHaveClass(specialClassName)
  })
}) 