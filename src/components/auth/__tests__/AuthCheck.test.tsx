import React from 'react'
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthCheck from '../AuthCheck'
import { render } from '@testing-library/react'

// Stub ThemeProvider used inside test-utils wrapper
jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

// ---- Mocks ----
let mockIsLoaded: boolean = false
let mockIsSignedIn: boolean = false

jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    isLoaded: mockIsLoaded,
    isSignedIn: mockIsSignedIn,
  }),
}))

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('AuthCheck', () => {
  beforeEach(() => {
    mockIsLoaded = false
    mockIsSignedIn = false
    mockPush.mockClear()
  })

  it('displays loading state when auth is not loaded', () => {
    mockIsLoaded = false
    mockIsSignedIn = false

    render(
      <AuthCheck>
        <div>Protected</div>
      </AuthCheck>
    )

    expect(screen.getByText('Checking authentication...')).toBeInTheDocument()
  })

  it('renders children when user is authenticated', () => {
    mockIsLoaded = true
    mockIsSignedIn = true

    render(
      <AuthCheck>
        <div data-testid="protected">Protected</div>
      </AuthCheck>
    )

    expect(screen.getByTestId('protected')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('renders fallback when unauthenticated and fallback provided', () => {
    mockIsLoaded = true
    mockIsSignedIn = false

    render(
      <AuthCheck fallback={<div data-testid="fallback">Please sign in</div>}>
        <div>Protected</div>
      </AuthCheck>
    )

    expect(screen.getByTestId('fallback')).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to sign-in when unauthenticated and no fallback provided', () => {
    mockIsLoaded = true
    mockIsSignedIn = false

    render(
      <AuthCheck>
        <div>Protected</div>
      </AuthCheck>
    )

    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in')
  })
}) 