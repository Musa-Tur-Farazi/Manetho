import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import CTASection from '../CTASection'

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

describe('CTASection', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders CTA section with title and description', () => {
    render(<CTASection />)
    
    expect(screen.getByText(/ready to transform your learning experience/i)).toBeInTheDocument()
    expect(screen.getByText(/join thousands of students/i)).toBeInTheDocument()
  })

  it('renders get started button', () => {
    render(<CTASection />)
    
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument()
  })

  it('calls router push on get started button click', () => {
    render(<CTASection />)
    
    const getStartedBtn = screen.getByRole('button', { name: /get started/i })
    fireEvent.click(getStartedBtn)
    
    expect(mockPush).toHaveBeenCalledWith('/tools/doubt-solving')
  })
}) 