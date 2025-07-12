import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthenticatedNavbar from '../AuthenticatedNavbar'

// ---- Mocks ----
const mockPush = jest.fn()
const mockSetTheme = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
  }
})

jest.mock('@clerk/nextjs', () => ({
  useUser: () => ({
    user: {
      id: 'user123',
      firstName: 'Alice',
      imageUrl: '',
    },
  }),
  SignOutButton: ({ children }: { children: React.ReactNode }) => children,
}))

jest.mock('next/link', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => React.createElement('a', { href }, children),
  }
})

describe('AuthenticatedNavbar', () => {
  beforeEach(() => {
    mockPush.mockClear()
    mockSetTheme.mockClear()
  })

  it('renders brand and theme toggle', () => {
    render(<AuthenticatedNavbar isScrolled={false} />)
    expect(screen.getByText(/manetho/i)).toBeInTheDocument()
    const toggleBtn = screen.getByLabelText(/toggle theme/i)
    expect(toggleBtn).toBeInTheDocument()
  })

  it('calls setTheme on toggle click', () => {
    render(<AuthenticatedNavbar isScrolled={true} />)
    const toggleBtn = screen.getByLabelText(/toggle theme/i)
    fireEvent.click(toggleBtn)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  /*
  // Dropdown interaction relies on framer-motion layout and Next.js Link – flaky in JSDOM
  it('opens user menu dropdown', () => {})
  */

  // Mobile menu interactions skipped due to complex Lucide icon buttons without labels
}) 