import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ContentCard from '../ContentCard'
import { customRender } from '../../../__tests__/utils/test-utils'

describe('ContentCard', () => {
  const defaultProps = {
    title: 'Test Card',
    description: 'This is a test description',
  }

  it('renders with title and description', () => {
    customRender(<ContentCard {...defaultProps} />)
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })

  it('renders with image when provided', () => {
    const propsWithImage = {
      ...defaultProps,
      image: 'https://example.com/test-image.jpg',
    }
    
    customRender(<ContentCard {...propsWithImage} />)
    
    const image = screen.getByRole('img')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg')
    expect(image).toHaveAttribute('alt', 'Test Card')
  })

  it('renders with icon when provided', () => {
    const TestIcon = () => <div data-testid="test-icon">🚀</div>
    
    customRender(
      <ContentCard 
        {...defaultProps} 
        icon={<TestIcon />} 
      />
    )
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders button when buttonText and buttonLink are provided', () => {
    const propsWithButton = {
      ...defaultProps,
      buttonText: 'Learn More',
      buttonLink: '/learn-more',
    }
    
    customRender(<ContentCard {...propsWithButton} />)
    
    const button = screen.getByRole('link', { name: 'Learn More' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('href', '/learn-more')
  })

  it('applies custom className', () => {
    // Use standard render instead of customRender
    const { container } = render(<ContentCard {...defaultProps} className="custom-class" />)
    
    // Get the div with the ContentCard component
    const cardDiv = container.querySelector('div')
    expect(cardDiv).not.toBeNull()
    expect(cardDiv?.className).toContain('custom-class')
  })

  it('renders without image when not provided', () => {
    customRender(<ContentCard {...defaultProps} />)
    
    const images = screen.queryAllByRole('img')
    expect(images).toHaveLength(0)
  })

  it('renders without button when buttonText is not provided', () => {
    customRender(<ContentCard {...defaultProps} buttonLink="/test" />)
    
    const buttons = screen.queryAllByRole('link')
    expect(buttons).toHaveLength(0)
  })

  it('renders without button when buttonLink is not provided', () => {
    customRender(<ContentCard {...defaultProps} buttonText="Learn More" />)
    
    const buttons = screen.queryAllByRole('link')
    expect(buttons).toHaveLength(0)
  })

  it('handles empty description gracefully', () => {
    const { container } = customRender(<ContentCard title="Test Card" description="" />)
    const paragraphs = container.querySelectorAll('p')
    // There should be one paragraph element even if it's empty
    expect(paragraphs.length).toBeGreaterThan(0)
  })

  it('handles very long title and description', () => {
    const longTitle = 'A'.repeat(100)
    const longDescription = 'B'.repeat(200)
    
    customRender(
      <ContentCard 
        title={longTitle} 
        description={longDescription} 
      />
    )
    
    expect(screen.getByText(longTitle)).toBeInTheDocument()
    expect(screen.getByText(longDescription)).toBeInTheDocument()
  })

  it('renders with all optional props', () => {
    const TestIcon = () => <div data-testid="test-icon">🎯</div>
    
    // Use standard render instead of customRender
    const { container } = render(
      <ContentCard 
        title="Complete Card"
        description="Full featured card"
        image="https://example.com/complete.jpg"
        icon={<TestIcon />}
        buttonText="Get Started"
        buttonLink="/start"
        className="complete-card"
      />
    )
    
    expect(screen.getByText('Complete Card')).toBeInTheDocument()
    expect(screen.getByText('Full featured card')).toBeInTheDocument()
    expect(screen.getByRole('img')).toBeInTheDocument()
    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument()
    
    // Get the div with the ContentCard component
    const cardDiv = container.querySelector('div')
    expect(cardDiv).not.toBeNull()
    expect(cardDiv?.className).toContain('complete-card')
  })
}) 