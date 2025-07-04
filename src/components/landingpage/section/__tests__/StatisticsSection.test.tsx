import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatisticsSection from '../StatisticsSection'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

// Mock setInterval to prevent animation
jest.useFakeTimers()

describe('StatisticsSection', () => {
  beforeEach(() => {
    jest.clearAllTimers()
  })

  it('renders statistics section with title and description', () => {
    render(<StatisticsSection />)
    
    expect(screen.getByText(/trusted by students worldwide/i)).toBeInTheDocument()
    expect(screen.getByText(/join the community of students/i)).toBeInTheDocument()
  })

  it('renders all four stat cards', () => {
    render(<StatisticsSection />)
    
    expect(screen.getByText(/active students/i)).toBeInTheDocument()
    expect(screen.getByText(/study materials/i)).toBeInTheDocument()
    expect(screen.getByText(/hours of study/i)).toBeInTheDocument()
    expect(screen.getByText(/satisfaction rate/i)).toBeInTheDocument()
  })

  it('displays stat cards with proper structure', () => {
    render(<StatisticsSection />)
    
    // Check that stat cards are rendered with their structure
    // The values are animated, so we check for the presence of the cards
    const statCards = screen.getAllByText(/active students|study materials|hours of study|satisfaction rate/i)
    expect(statCards).toHaveLength(4)
  })

  it('renders with proper accessibility structure', () => {
    render(<StatisticsSection />)
    
    // Check that the section has proper heading structure
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent(/trusted by students worldwide/i)
  })
}) 