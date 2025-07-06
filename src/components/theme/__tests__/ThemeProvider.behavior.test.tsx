import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../ThemeProvider'

// Stub matchMedia
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query.includes('prefers-color-scheme: dark'),
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })
})

afterEach(() => {
  document.documentElement.className = ''
  localStorage.clear()
})

const Consumer = () => {
  const { theme, setTheme } = useTheme()
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>toggle</button>
  )
}

describe('ThemeProvider system & storage', () => {
  it('applies system dark theme when defaultTheme="system"', () => {
    render(
      <ThemeProvider defaultTheme="system">
        <div>child</div>
      </ThemeProvider>
    )
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setTheme persists to localStorage and updates class', () => {
    render(
      <ThemeProvider defaultTheme="light">
        <Consumer />
      </ThemeProvider>
    )

    const btn = screen.getByRole('button', { name: /toggle/i })
    fireEvent.click(btn)

    expect(localStorage.getItem('manetho-theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })
}) 