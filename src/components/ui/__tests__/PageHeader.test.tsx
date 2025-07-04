import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PageHeader from '../PageHeader'
import { customRender } from '../../../__tests__/utils/test-utils'

describe('PageHeader', () => {
  const defaultProps = {
    title: 'Test Page',
  }

  it('renders with title', () => {
    customRender(<PageHeader {...defaultProps} />)
    
    expect(screen.getByText('Test Page')).toBeInTheDocument()
  })

  it('renders with description when provided', () => {
    const propsWithDescription = {
      ...defaultProps,
      description: 'This is a test page description',
    }
    
    customRender(<PageHeader {...propsWithDescription} />)
    
    expect(screen.getByText('This is a test page description')).toBeInTheDocument()
  })

  it('renders children when provided', () => {
    customRender(
      <PageHeader {...defaultProps}>
        <button>Action Button</button>
      </PageHeader>
    )
    
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  it('renders with background image when provided', () => {
    const propsWithBackground = {
      ...defaultProps,
      backgroundImage: 'https://example.com/background.jpg',
    }
    
    const { container } = customRender(<PageHeader {...propsWithBackground} />)
    const bgDiv = container.querySelector('div[style*="background-image"]') as HTMLElement
    expect(bgDiv).toBeInTheDocument()
    expect(bgDiv.getAttribute('style')).toContain('https://example.com/background.jpg')
  })

  it('renders without description when not provided', () => {
    customRender(<PageHeader {...defaultProps} />)
    
    const descriptions = screen.queryAllByText(/description/i)
    expect(descriptions).toHaveLength(0)
  })

  it('renders without children when not provided', () => {
    customRender(<PageHeader {...defaultProps} />)
    
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)
  })

  it('renders without background image when not provided', () => {
    const { container } = customRender(<PageHeader {...defaultProps} />)
    const bgDiv = container.querySelector('div[style*="background-image"]')
    expect(bgDiv).toBeNull()
  })

  it('handles empty title gracefully', () => {
    const { container } = customRender(<PageHeader title="" />)
    const heading = container.querySelector('h1')
    expect(heading).toBeInTheDocument()
    expect(heading?.textContent).toBe('')
  })

  it('handles very long title', () => {
    const longTitle = 'A'.repeat(200)
    
    customRender(<PageHeader title={longTitle} />)
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
  })

  it('handles very long description', () => {
    const longDescription = 'B'.repeat(500)
    
    customRender(
      <PageHeader 
        {...defaultProps} 
        description={longDescription} 
      />
    )
    
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('renders with all props', () => {
    const { container } = customRender(
      <PageHeader 
        title="Complete Header"
        description="Full featured header with all props"
        backgroundImage="https://example.com/complete-bg.jpg"
      >
        <button>Primary Action</button>
        <button>Secondary Action</button>
      </PageHeader>
    )
    
    expect(screen.getByText('Complete Header')).toBeInTheDocument()
    expect(screen.getByText('Full featured header with all props')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument()
    
    const bgDiv = container.querySelector('div[style*="background-image"]') as HTMLElement
    expect(bgDiv).toBeInTheDocument()
    expect(bgDiv.getAttribute('style')).toContain('https://example.com/complete-bg.jpg')
  })

  it('renders with complex children', () => {
    const ComplexChild = () => (
      <div data-testid="complex-child">
        <span>Complex</span>
        <span>Content</span>
      </div>
    )
    
    customRender(
      <PageHeader {...defaultProps}>
        <ComplexChild />
      </PageHeader>
    )
    
    expect(screen.getByTestId('complex-child')).toBeInTheDocument()
    expect(screen.getByText('Complex')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('handles special characters in title', () => {
    const specialTitle = 'Test Page with 🚀 emoji & <script>alert("xss")</script>'
    
    customRender(<PageHeader title={specialTitle} />)
    
    expect(screen.getByText(specialTitle)).toBeInTheDocument()
  })

  it('handles special characters in description', () => {
    const specialDescription = 'Description with 🎯 emoji & <strong>HTML</strong>'
    
    customRender(
      <PageHeader 
        {...defaultProps} 
        description={specialDescription} 
      />
    )
    
    expect(screen.getByText(specialDescription)).toBeInTheDocument()
  })
}) 