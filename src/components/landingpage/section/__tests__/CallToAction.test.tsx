import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CallToAction from '../CallToAction'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('../../AuthProtectedLink', () => ({
  __esModule: true,
  default: ({ href, children, onClick }: any) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
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

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('CallToAction', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders call to action section with title and description', () => {
    render(<CallToAction />)
    
    expect(screen.getByText(/ready to transform your learning experience/i)).toBeInTheDocument()
    expect(screen.getByText(/join thousands of students/i)).toBeInTheDocument()
  })

  it('renders get started and pricing buttons', () => {
    render(<CallToAction />)
    
    expect(screen.getByRole('button', { name: /get started for free/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view pricing/i })).toBeInTheDocument()
  })

  it('calls router push on get started button click', () => {
    render(<CallToAction />)
    
    const getStartedBtn = screen.getByRole('button', { name: /get started for free/i })
    fireEvent.click(getStartedBtn)
    
    expect(mockPush).toHaveBeenCalledWith('/signup')
  })

  it('calls router push on pricing button click', () => {
    render(<CallToAction />)
    
    const pricingBtn = screen.getByRole('button', { name: /view pricing/i })
    fireEvent.click(pricingBtn)
    
    expect(mockPush).toHaveBeenCalledWith('/pricing')
  })
}) 