import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
import Testimonials from '../Testimonials'

jest.useFakeTimers()

describe('Testimonials carousel', () => {
  it('advances automatically every 5 seconds', () => {
    render(<Testimonials />)

    // initial first testimonial name visible
    expect(screen.getByText(/sophia chen/i)).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(6000)
    })

    expect(screen.getByText(/raj patel/i)).toBeInTheDocument()
  })

  it('next arrow advances testimonial immediately', () => {
    const { container } = render(<Testimonials />)

    const rightBtn = container.querySelector('button svg.lucide-chevron-right')?.parentElement as HTMLElement
    expect(rightBtn).toBeTruthy()

    fireEvent.click(rightBtn)

    expect(screen.getByText(/raj patel/i)).toBeInTheDocument()
  })
}) 