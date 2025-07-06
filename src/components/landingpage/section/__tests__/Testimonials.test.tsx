import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Testimonials from '../Testimonials'

// Utility to set viewport width
const setScreenWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width })
}

describe('Testimonials component', () => {
  beforeEach(() => {
    setScreenWidth(800) // Medium screen so 2 testimonials visible
  })

  it('renders heading text', () => {
    const { getByRole } = render(<Testimonials />)
    expect(getByRole('heading', { name: /what our students say/i })).toBeInTheDocument()
  })

  it('changes active testimonial indicator when bullet clicked', () => {
    const { container } = render(<Testimonials />)

    // Small bullet indicators have width class w-3 similar to carousel
    const bullets = Array.from(container.querySelectorAll('button.w-3')) as HTMLButtonElement[]
    expect(bullets.length).toBeGreaterThan(0)

    // First bullet should initially have the gradient class for active state
    expect(bullets[0].className).toContain('bg-gradient-to-r')

    // Click on the last bullet
    const lastBullet = bullets[bullets.length - 1]
    fireEvent.click(lastBullet)

    // Last bullet should now contain the active gradient class
    expect(lastBullet.className).toContain('bg-gradient-to-r')
  })
}) 