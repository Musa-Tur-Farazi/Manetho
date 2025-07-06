import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '../Footer'

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
})
window.IntersectionObserver = mockIntersectionObserver

describe('Footer', () => {
  it('renders footer with brand name and description', () => {
    render(<Footer />)
    
    expect(screen.getByText('Manetho')).toBeInTheDocument()
    expect(screen.getByText(/your ai-powered companion/i)).toBeInTheDocument()
  })

  it('renders social media links', () => {
    render(<Footer />)
    
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument()
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument()
  })

  it('renders about links', () => {
    render(<Footer />)
    
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument()
    expect(screen.getByText('Terms of Service')).toBeInTheDocument()
    expect(screen.getByText('Cookie Policy')).toBeInTheDocument()
  })

  it('renders contact email', () => {
    render(<Footer />)
    
    expect(screen.getByText('contact@manetho.edu')).toBeInTheDocument()
  })

  it('renders copyright notice', () => {
    render(<Footer />)
    
    expect(screen.getByText(/© 2025 Manetho. All rights reserved./i)).toBeInTheDocument()
  })

  it('renders with proper accessibility structure', () => {
    render(<Footer />)
    
    // Check that social links have proper aria-labels
    const twitterLink = screen.getByLabelText('Twitter')
    const linkedinLink = screen.getByLabelText('LinkedIn')
    const githubLink = screen.getByLabelText('GitHub')
    const instagramLink = screen.getByLabelText('Instagram')
    
    expect(twitterLink).toBeInTheDocument()
    expect(linkedinLink).toBeInTheDocument()
    expect(githubLink).toBeInTheDocument()
    expect(instagramLink).toBeInTheDocument()
  })
}) 