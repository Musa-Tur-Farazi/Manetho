import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { customRender } from '@/__tests__/utils/test-utils'
import AuthProtectedLink from '@/components/landingpage/AuthProtectedLink'

// Mock useAuth from Clerk
jest.mock('@clerk/nextjs', () => ({
  useAuth: jest.fn()
}))

describe('AuthProtectedLink', () => {
  const mockUseAuth = require('@clerk/nextjs').useAuth

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render link when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    customRender(
      <AuthProtectedLink href="/dashboard" className="test-class">
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(link).toHaveClass('test-class')
  })

  it('should render link when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: true
    })

    customRender(
      <AuthProtectedLink href="/dashboard" className="test-class">
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/dashboard')
    expect(link).toHaveClass('test-class')
  })

  it('should handle click event', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    const handleClick = jest.fn()

    customRender(
      <AuthProtectedLink href="/dashboard" onClick={handleClick}>
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    fireEvent.click(link)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render with default className when not provided', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    customRender(
      <AuthProtectedLink href="/dashboard">
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    expect(link).toBeInTheDocument()
    // Don't check for empty class as it's not reliable in all test environments
    expect(link.className).toBe('')
  })

  it('should handle loading state', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: false
    })

    customRender(
      <AuthProtectedLink href="/dashboard">
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    expect(link).toBeInTheDocument()
  })

  it('should render with target attribute', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    customRender(
      <AuthProtectedLink href="/dashboard" target="_blank">
        Dashboard
      </AuthProtectedLink>
    )

    const link = screen.getByText('Dashboard')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should render with custom onClick and href', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    const handleClick = jest.fn()

    customRender(
      <AuthProtectedLink href="/profile" onClick={handleClick}>
        Profile
      </AuthProtectedLink>
    )

    const link = screen.getByText('Profile')
    expect(link).toHaveAttribute('href', '/profile')
    
    fireEvent.click(link)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should render with complex children', () => {
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    customRender(
      <AuthProtectedLink href="/dashboard">
        <span>Dashboard</span>
        <span>Icon</span>
      </AuthProtectedLink>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Icon')).toBeInTheDocument()
  })

  it('should handle authentication state changes', () => {
    const { rerender } = customRender(
      <AuthProtectedLink href="/dashboard">
        Dashboard
      </AuthProtectedLink>
    )

    // Initially not signed in
    mockUseAuth.mockReturnValue({
      isSignedIn: false,
      isLoaded: true
    })

    rerender(
      <AuthProtectedLink href="/dashboard">
        Dashboard
      </AuthProtectedLink>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    // Then signed in
    mockUseAuth.mockReturnValue({
      isSignedIn: true,
      isLoaded: true
    })

    rerender(
      <AuthProtectedLink href="/dashboard">
        Dashboard
      </AuthProtectedLink>
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
}) 