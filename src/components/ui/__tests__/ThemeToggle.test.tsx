import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ---- Mocks ----
const mockSetTheme = jest.fn()
let mockTheme: 'light' | 'dark' | 'system' | undefined = 'light'

// Mock ThemeProvider module BEFORE importing components that rely on it.
jest.mock('../../theme/ThemeProvider', () => {
  const React = require('react')
  return {
    __esModule: true,
    // Stub ThemeProvider to simply render children
    ThemeProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useTheme: () => ({
      theme: mockTheme,
      setTheme: mockSetTheme,
    }),
  }
})

import ThemeToggle from '../../theme/ThemeToggle'
import { customRender } from '../../../__tests__/utils/test-utils'

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
    mockTheme = 'light'
  })

  it('renders theme toggle button', () => {
    customRender(<ThemeToggle />)
    
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('toggles theme when clicked', () => {
    customRender(<ThemeToggle />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  // Additional interactions and edge cases can be tested in integration suites.
}) 