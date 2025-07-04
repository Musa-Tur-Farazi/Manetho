import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Navbar from '../Navbar'

// ---- Mocks ----
const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/components/theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  }
})

// Mock Clerk auth hook
jest.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false }),
}))

describe('Navbar (landing)', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders brand and login button', () => {
    render(<Navbar />)

    expect(screen.getByText(/manetho/i)).toBeInTheDocument()
    const loginBtn = screen.getByRole('button', { name: /log in/i })
    expect(loginBtn).toBeInTheDocument()
  })

  it('navigates to sign-in on login click', () => {
    render(<Navbar />)

    const loginBtn = screen.getByRole('button', { name: /log in/i })
    fireEvent.click(loginBtn)

    expect(mockPush).toHaveBeenCalledWith('/custom-auth/sign-in?redirect_url=%2Fhome')
  })
}) 