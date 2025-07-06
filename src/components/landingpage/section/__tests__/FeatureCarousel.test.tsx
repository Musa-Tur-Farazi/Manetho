import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import FeatureCarousel from '../FeatureCarousel'

// Helper to reset window size per test
const setScreenWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
}

describe('FeatureCarousel', () => {
  beforeEach(() => {
    setScreenWidth(500) // Force mobile view (1 visible card)
    // Mock scrollTo since JSDOM doesn't implement it
    if (!HTMLElement.prototype.scrollTo) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', { value: jest.fn(), writable: true })
    }
  })

  it('renders feature titles', () => {
    render(<FeatureCarousel />)

    expect(screen.getByText(/AI Doubt Solving/i)).toBeInTheDocument()
    expect(screen.getByText(/Study Materials/i)).toBeInTheDocument()
  })

  it('updates active bullet when a bullet dot is clicked', () => {
    render(<FeatureCarousel />)

    // Bullet dots have the Tailwind width class `w-3`
    const bulletDots = Array.from(document.querySelectorAll('button.w-3')) as HTMLButtonElement[]
    expect(bulletDots).toHaveLength(5)

    // Initially first bullet should be active (bg-cyan-600 class)
    expect(bulletDots[0].className).toContain('bg-cyan-600')

    // Click third bullet (index 2)
    fireEvent.click(bulletDots[2])

    // Now the third bullet should be active
    expect(bulletDots[2].className).toContain('bg-cyan-600')
  })
}) 