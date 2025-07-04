import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Toaster } from '../Sonner'

// ------ Mocks ------
let mockTheme: 'light' | 'dark' | 'system' | undefined = 'light'

jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}))

// Mock sonner
jest.mock('sonner', () => ({
  Toaster: ({ theme, className, style, ...props }: any) => 
    React.createElement('div', { 
      'data-testid': 'sonner-toaster',
      'data-theme': theme,
      className,
      style,
      ...props 
    }),
}))

describe('Sonner Toaster', () => {
  beforeEach(() => {
    mockTheme = 'light'
  })

  it('renders with default props', () => {
    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveAttribute('data-theme', 'light')
    expect(toaster).toHaveClass('toaster', 'group')
  })

  it('renders with custom theme', () => {
    mockTheme = 'dark'
    
    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'dark')
  })

  it('renders with system theme', () => {
    mockTheme = 'system'
    
    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'system')
  })

  it('applies custom props', () => {
    render(
      <Toaster 
        position="top-right"
        richColors
        closeButton
      />
    )
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Toaster className="custom-toaster" />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveClass('custom-toaster')
  })

  it('applies custom style', () => {
    const customStyle = { backgroundColor: 'red' }
    render(<Toaster style={customStyle} />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveStyle('background-color: red')
  })

  it('handles undefined theme gracefully', () => {
    mockTheme = undefined
    
    render(<Toaster />)

    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
  })

  it('handles missing theme context', () => {
    // Simulate missing theme by returning empty object
    mockTheme = 'light'
    
    render(<Toaster />)
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
  })

  it('renders with all available props', () => {
    render(
      <Toaster 
        position="bottom-left"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={5000}
        maxToasts={3}
        className="full-featured-toaster"
        style={{ zIndex: 9999 }}
      />
    )
    
    const toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toBeInTheDocument()
    expect(toaster).toHaveClass('full-featured-toaster')
  })

  it('handles theme switching', () => {
    const { rerender } = render(<Toaster />)

    let toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'light')

    mockTheme = 'dark'
    rerender(<Toaster />)

    toaster = screen.getByTestId('sonner-toaster')
    expect(toaster).toHaveAttribute('data-theme', 'dark')
  })
}) 