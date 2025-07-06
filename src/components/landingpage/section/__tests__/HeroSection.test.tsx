import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeroSection from '../HeroSection'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../AuthProtectedLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick }: any) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      // Simulate the AuthProtectedLink behavior - call router push
      const { useRouter } = require('next/navigation')
      const router = useRouter()
      router.push(href)
      if (onClick) onClick()
    }
    
    return React.createElement('a', { 
      href, 
      'data-testid': 'protected-link',
      onClick: handleClick
    }, children)
  },
}))

describe('HeroSection', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders headline and get started button', () => {
    render(<HeroSection />)
    expect(screen.getByText(/your ai-powered/i)).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /get started/i })
    expect(btn).toBeInTheDocument()
  })

  it('calls router push on get started click', () => {
    render(<HeroSection />)
    const btn = screen.getByRole('button', { name: /get started/i })
    fireEvent.click(btn)
    expect(mockPush).toHaveBeenCalledWith('/tools/doubt-solving')
  })
}) 