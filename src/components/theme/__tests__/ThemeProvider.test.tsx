import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Helper component to consume the theme context
function Consumer() {
  const { theme, setTheme } = useTheme()
  return (
    <button data-testid="theme-btn" data-current-theme={theme} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      toggle
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    // Ensure clean state
    document.documentElement.className = ''
    localStorage.clear()
  })

  it('applies default theme prop', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <Consumer />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass('dark')
    const btn = screen.getByTestId('theme-btn')
    expect(btn).toHaveAttribute('data-current-theme', 'dark')
  })

  it('toggles theme via setTheme', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>
    )

    const btn = screen.getByTestId('theme-btn')
    expect(document.documentElement).toHaveClass('light')

    fireEvent.click(btn)

    waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
      expect(btn).toHaveAttribute('data-current-theme', 'dark')
    })
  })

  it('loads theme from localStorage', () => {
    localStorage.setItem('manetho-theme', 'dark')

    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>
    )

    expect(document.documentElement).toHaveClass('dark')
    const btn = screen.getByTestId('theme-btn')
    expect(btn).toHaveAttribute('data-current-theme', 'dark')
  })
}) 